import { ok, readJson } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { getProfile, getUserRow } from '@/lib/users.js';
import { validateProfilePatch } from '@/lib/validation.js';

// GET /auth/me (Spec §3.3) · PATCH /auth/me (Spec §3.4)

export const GET = requireAuth(async (_request, { user }) => ok(await getProfile(user.user_id)));

export const PATCH = requireAuth(async (request, { user }) => {
  const body = await readJson(request);
  const current = await getUserRow(user.user_id);
  const patch = validateProfilePatch(body, current);

  if (Object.keys(patch).length > 0) {
    const { error } = await db().from('users').update(patch).eq('user_id', user.user_id);
    if (error) throw error;
  }
  return ok(await getProfile(user.user_id));
});
