import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFaculty, validateProfilePatch, validateRegistration } from '../lib/validation.js';

const valid = {
  email: '  Nisit.K@Student.Chula.ac.th ',
  password: 'UniTrade2026!',
  full_name: 'กันตภณ  ชัยรุ่งปัญญา',
  phone_number: '081-234-5678',
  line_id: 'kanta_ph',
  faculty: 'คณะวิศวกรรมศาสตร์',
};

const codeOf = (fn) => {
  try {
    fn();
  } catch (err) {
    return err.code;
  }
  return 'NO_ERROR';
};

test('valid registration is normalised', () => {
  assert.deepEqual(validateRegistration(valid), {
    email: 'nisit.k@student.chula.ac.th',
    password: 'UniTrade2026!',
    full_name: 'กันตภณ ชัยรุ่งปัญญา',
    phone_number: '0812345678',
    line_id: 'kanta_ph',
    faculty: 'คณะวิศวกรรมศาสตร์',
  });
});

test('staff domain @chula.ac.th is accepted', () => {
  assert.equal(validateRegistration({ ...valid, email: 'a.b@chula.ac.th' }).email, 'a.b@chula.ac.th');
});

test('non-CU emails are rejected with NON_CU_EMAIL', () => {
  for (const email of ['a@gmail.com', 'a@hotmail.com', 'a@chula.ac.th.evil.com', 'a@fakechula.ac.th', '', undefined, 42]) {
    assert.equal(codeOf(() => validateRegistration({ ...valid, email })), 'NON_CU_EMAIL', String(email));
  }
});

test('weak passwords are rejected with WEAK_PASSWORD', () => {
  for (const password of ['short1', 'abcdefgh', '12345678', '', undefined]) {
    assert.equal(codeOf(() => validateRegistration({ ...valid, password })), 'WEAK_PASSWORD', String(password));
  }
  assert.equal(codeOf(() => validateRegistration({ ...valid, password: 'รหัสผ่าน2026' })), 'NO_ERROR');
});

test('password longer than 72 bytes is rejected', () => {
  const thai = 'ก'.repeat(24) + '1'; // 73 bytes
  assert.equal(codeOf(() => validateRegistration({ ...valid, password: thai })), 'VALIDATION_ERROR');
});

test('no phone and no LINE gives MISSING_CONTACT', () => {
  assert.equal(codeOf(() => validateRegistration({ ...valid, phone_number: '', line_id: null })), 'MISSING_CONTACT');
  assert.equal(codeOf(() => validateRegistration({ ...valid, phone_number: undefined })), 'NO_ERROR');
  assert.equal(codeOf(() => validateRegistration({ ...valid, line_id: '' })), 'NO_ERROR');
});

test('bad phone and LINE formats are rejected', () => {
  assert.equal(codeOf(() => validateRegistration({ ...valid, phone_number: '12345' })), 'VALIDATION_ERROR');
  assert.equal(codeOf(() => validateRegistration({ ...valid, line_id: 'มีภาษาไทย' })), 'VALIDATION_ERROR');
  assert.equal(validateRegistration({ ...valid, phone_number: '+66812345678' }).phone_number, '+66812345678');
});

test('faculty rules', () => {
  assert.equal(codeOf(() => resolveFaculty(undefined)), 'INVALID_FACULTY');
  assert.equal(codeOf(() => resolveFaculty('คณะที่ไม่มีจริง')), 'INVALID_FACULTY');
  assert.equal(codeOf(() => resolveFaculty('other', '')), 'INVALID_FACULTY');
  assert.equal(codeOf(() => resolveFaculty('other', 'ก')), 'INVALID_FACULTY');
  assert.equal(resolveFaculty('other', ' สำนักงานมหาวิทยาลัย '), 'สำนักงานมหาวิทยาลัย');
  assert.equal(resolveFaculty('other', 'คณะวิทยาศาสตร์'), 'คณะวิทยาศาสตร์');
});

test('profile patch keeps at least one contact', () => {
  const current = { phone_number: '0812345678', line_id: null };
  assert.equal(codeOf(() => validateProfilePatch({ phone_number: '' }, current)), 'MISSING_CONTACT');
  assert.deepEqual(validateProfilePatch({ phone_number: '', line_id: 'new_id' }, current), {
    phone_number: null,
    line_id: 'new_id',
  });
});

test('profile patch ignores email and role', () => {
  const current = { phone_number: '0812345678', line_id: null };
  assert.deepEqual(validateProfilePatch({ email: 'x@gmail.com', role: 'admin', full_name: 'ชื่อ ใหม่' }, current), {
    full_name: 'ชื่อ ใหม่',
  });
});
