import { ok, route } from '@/lib/http.js';
import { FACULTIES, FACULTY_OTHER } from '@/lib/constants.js';

// GET /faculties (Spec §4.3) — dropdown คณะตอนลงทะเบียนและแก้ไขโปรไฟล์

export const GET = route(async () => ok({ data: FACULTIES, allow_other: true, other_value: FACULTY_OTHER }));
