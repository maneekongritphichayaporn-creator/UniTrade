import { ApiError } from './http.js';
import { FACULTIES, FACULTY_OTHER } from './constants.js';

// กติกา Validate Registration (Spec §3.1) — ต้องตรงกับ CHECK constraint ใน 0001_init.sql

const CU_EMAIL = /^[A-Za-z0-9._%+-]+@(student\.chula\.ac\.th|chula\.ac\.th)$/;
const PHONE = /^(0|\+66)[0-9]{8,9}$/;
const LINE_ID = /^[A-Za-z0-9._-]{2,100}$/;
const BCRYPT_MAX_BYTES = 72;

const invalid = (field, message) => new ApiError(422, 'VALIDATION_ERROR', message, field);

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (email.length > 254 || !CU_EMAIL.test(email)) {
    throw new ApiError(422, 'NON_CU_EMAIL', 'อนุญาตเฉพาะอีเมล @student.chula.ac.th หรือ @chula.ac.th', 'email');
  }
  return email;
}

export function passwordTooLong(password) {
  return Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || !/\p{L}/u.test(value) || !/[0-9]/.test(value)) {
    throw new ApiError(
      422,
      'WEAK_PASSWORD',
      'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข',
      'password',
    );
  }
  // bcrypt ใช้แค่ 72 ไบต์แรก ภาษาไทยตัวละ 3 ไบต์ จึงจำกัดไว้ไม่ให้ส่วนท้ายถูกตัดทิ้งเงียบ ๆ
  if (passwordTooLong(value)) {
    throw invalid('password', 'รหัสผ่านยาวเกินไป (ภาษาอังกฤษไม่เกิน 72 ตัว หรือภาษาไทยไม่เกิน 24 ตัว)');
  }
  return value;
}

export function validateFullName(value) {
  const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (name.length < 2 || name.length > 255) {
    throw invalid('full_name', 'ชื่อ-นามสกุลต้องยาว 2–255 ตัวอักษร');
  }
  return name;
}

// ช่องว่าง/ไม่ส่ง → null · รับ "081-234-5678" และ "081 234 5678" แล้วเก็บเป็นตัวเลขล้วน
export function normalizePhone(value) {
  if (isBlank(value)) return null;
  const phone = typeof value === 'string' ? value.replace(/[\s-]/g, '') : '';
  if (!PHONE.test(phone)) {
    throw invalid('phone_number', 'เบอร์โทรต้องอยู่ในรูปแบบ 0XXXXXXXXX หรือ +66XXXXXXXXX');
  }
  return phone;
}

export function normalizeLineId(value) {
  if (isBlank(value)) return null;
  const lineId = typeof value === 'string' ? value.trim() : '';
  if (!LINE_ID.test(lineId)) {
    throw invalid('line_id', 'LINE ID ต้องยาว 2–100 ตัว ใช้ได้เฉพาะ A-Z a-z 0-9 . _ -');
  }
  return lineId;
}

export function requireContact(phoneNumber, lineId) {
  if (!phoneNumber && !lineId) {
    throw new ApiError(422, 'MISSING_CONTACT', 'กรุณากรอกเบอร์โทรหรือ LINE ID อย่างน้อยหนึ่งช่องทาง', 'phone_number');
  }
}

// คืนชื่อคณะที่จะบันทึก · "other" ใช้ข้อความใน faculty_other แต่ถ้าตรงกับชื่อในรายการให้ใช้ชื่อในรายการ
export function resolveFaculty(faculty, facultyOther) {
  const fail = () =>
    new ApiError(422, 'INVALID_FACULTY', 'กรุณาเลือกคณะจากรายการ หรือเลือกอื่น ๆ แล้วระบุ', 'faculty');

  if (typeof faculty !== 'string') throw fail();
  if (FACULTIES.includes(faculty)) return faculty;
  if (faculty !== FACULTY_OTHER) throw fail();

  const other = typeof facultyOther === 'string' ? facultyOther.trim().replace(/\s+/g, ' ') : '';
  if (other.length < 2 || other.length > 100) throw fail();
  return FACULTIES.find((name) => name === other) ?? other;
}

export function validateRegistration(body) {
  const email = validateEmail(body.email);
  const password = validatePassword(body.password);
  const full_name = validateFullName(body.full_name);
  const phone_number = normalizePhone(body.phone_number);
  const line_id = normalizeLineId(body.line_id);
  requireContact(phone_number, line_id);
  const faculty = resolveFaculty(body.faculty, body.faculty_other);
  return { email, password, full_name, phone_number, line_id, faculty };
}

// PATCH /auth/me — แก้ได้เฉพาะ 4 ช่องนี้ email/role และช่องอื่นถูกข้ามไป (Spec §3.4)
// ส่ง phone_number หรือ line_id เป็น null/"" เพื่อลบได้ แต่ต้องเหลืออย่างน้อยหนึ่งช่องทาง
export function validateProfilePatch(body, current) {
  const patch = {};
  if ('full_name' in body) patch.full_name = validateFullName(body.full_name);
  if ('phone_number' in body) patch.phone_number = normalizePhone(body.phone_number);
  if ('line_id' in body) patch.line_id = normalizeLineId(body.line_id);
  if ('faculty' in body) patch.faculty = resolveFaculty(body.faculty, body.faculty_other);

  const phone = 'phone_number' in patch ? patch.phone_number : current.phone_number;
  const line = 'line_id' in patch ? patch.line_id : current.line_id;
  requireContact(phone, line);
  return patch;
}
