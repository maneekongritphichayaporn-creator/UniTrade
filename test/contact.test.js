import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SAFETY_NOTE,
  CONTACT_SELECT,
  lineDeepLink,
  phoneDeepLink,
  buildChannels,
  toContact,
} from '../lib/contact.js';

test('phoneDeepLink: เบอร์ขึ้นต้น 0 แปลงเป็น +66, เบอร์ +66 คงเดิม', () => {
  assert.equal(phoneDeepLink('0812345678'), 'tel:+66812345678');
  assert.equal(phoneDeepLink('021234567'), 'tel:+6621234567');
  assert.equal(phoneDeepLink('+66812345678'), 'tel:+66812345678');
});

test('lineDeepLink: ลิงก์เพิ่มเพื่อน LINE', () => {
  assert.equal(lineDeepLink('kanta_ph'), 'https://line.me/ti/p/~kanta_ph');
});

test('buildChannels: มีทั้ง LINE และโทร -> LINE เป็นช่องทางหลัก', () => {
  assert.deepEqual(buildChannels({ line_id: 'kanta_ph', phone_number: '0812345678' }), [
    { type: 'line', value: 'kanta_ph', deep_link: 'https://line.me/ti/p/~kanta_ph', is_primary: true },
    { type: 'phone', value: '0812345678', deep_link: 'tel:+66812345678', is_primary: false },
  ]);
});

test('buildChannels: ส่งเฉพาะช่องทางที่ผู้ขายกรอก', () => {
  assert.deepEqual(buildChannels({ line_id: null, phone_number: '0812345678' }), [
    { type: 'phone', value: '0812345678', deep_link: 'tel:+66812345678', is_primary: true },
  ]);
  const lineOnly = buildChannels({ line_id: 'bruno_new', phone_number: null });
  assert.equal(lineOnly.length, 1);
  assert.equal(lineOnly[0].type, 'line');
  assert.deepEqual(buildChannels({}), []);
  assert.deepEqual(buildChannels(null), []);
});

test('toContact: รูปแบบตาม Spec §8.1 และไม่มี email/password_hash', () => {
  const contact = toContact({
    pickup_location: 'ศาลาพระเกี้ยว',
    seller: {
      user_id: 'u1',
      full_name: 'กันตภณ ชัยรุ่งปัญญา',
      faculty: 'คณะวิศวกรรมศาสตร์',
      phone_number: '0812345678',
      line_id: 'kanta_ph',
      email: 'should-not-leak@student.chula.ac.th',
    },
  });
  assert.deepEqual(contact.seller, {
    user_id: 'u1',
    full_name: 'กันตภณ ชัยรุ่งปัญญา',
    faculty: 'คณะวิศวกรรมศาสตร์',
  });
  assert.equal(contact.channels.length, 2);
  assert.equal(contact.pickup_location, 'ศาลาพระเกี้ยว');
  assert.equal(contact.safety_note, SAFETY_NOTE);
  assert.ok(!JSON.stringify(contact).includes('should-not-leak'));
});

test('CONTACT_SELECT: ระบุคอลัมน์ users เอง ไม่ดึง email หรือ password_hash', () => {
  assert.ok(!CONTACT_SELECT.includes('*'));
  assert.ok(!CONTACT_SELECT.includes('email'));
  assert.ok(!CONTACT_SELECT.includes('password_hash'));
});
