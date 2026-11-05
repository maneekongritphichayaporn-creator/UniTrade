import test from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath } from '../lib/client/routes.js';

test('safeNextPath allows in-site paths', () => {
  assert.equal(safeNextPath('/products/0b5c2f2e-1111-4a4a-8a8a-123456789abc'), '/products/0b5c2f2e-1111-4a4a-8a8a-123456789abc');
  assert.equal(safeNextPath('/?keyword=แคลคูลัส'), '/?keyword=แคลคูลัส');
});

test('safeNextPath blocks paths a browser would send to another site', () => {
  for (const next of ['//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', 'https://evil.com', 'evil.com', null]) {
    assert.equal(safeNextPath(next), null, JSON.stringify(next));
  }
});
