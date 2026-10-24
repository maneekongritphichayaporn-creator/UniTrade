import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
const { optionalAuth, readUser, requireAuth, signToken } = await import('../lib/auth.js');

const user = { user_id: '9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111', role: 'member' };
const req = (authorization) =>
  new Request('http://localhost/api/v1/auth/me', { headers: authorization ? { authorization } : {} });

test('signed token carries sub, role and a 24h expiry', () => {
  const payload = jwt.decode(signToken(user));
  assert.equal(payload.sub, user.user_id);
  assert.equal(payload.role, 'member');
  assert.equal(payload.exp - payload.iat, 86400);
});

test('readUser returns the user for a valid bearer token', () => {
  assert.deepEqual(readUser(req(`Bearer ${signToken(user)}`)), user);
});

test('readUser returns null without a header', () => {
  assert.equal(readUser(req()), null);
});

test('expired token gives TOKEN_EXPIRED', () => {
  const expired = jwt.sign({ role: 'member' }, process.env.JWT_SECRET, { subject: user.user_id, expiresIn: -10 });
  assert.throws(() => readUser(req(`Bearer ${expired}`)), { code: 'TOKEN_EXPIRED' });
});

test('wrong secret, alg none and junk all give UNAUTHORIZED', () => {
  const forged = jwt.sign({ role: 'admin' }, 'some-other-secret-that-is-long-enough!!', { subject: user.user_id });
  const none = jwt.sign({ role: 'admin', sub: user.user_id }, null, { algorithm: 'none' });
  for (const header of [`Bearer ${forged}`, `Bearer ${none}`, 'Bearer junk', 'Basic abc', 'Bearer']) {
    assert.throws(() => readUser(req(header)), { code: 'UNAUTHORIZED' }, header);
  }
});

test('requireAuth answers 401 without a token and passes user through with one', async () => {
  const handler = requireAuth(async (_request, { user: u, params }) => Response.json({ u, params: await params }));

  const denied = await handler(req(), { params: Promise.resolve({}) });
  assert.equal(denied.status, 401);
  assert.equal((await denied.json()).error.code, 'UNAUTHORIZED');

  const allowed = await handler(req(`Bearer ${signToken(user)}`), { params: Promise.resolve({ id: 'x' }) });
  assert.deepEqual(await allowed.json(), { u: user, params: { id: 'x' } });
});

test('optionalAuth treats a bad token as a guest', async () => {
  const handler = optionalAuth(async (_request, { user: u }) => Response.json({ u }));
  assert.deepEqual(await (await handler(req('Bearer junk'), {})).json(), { u: null });
});
