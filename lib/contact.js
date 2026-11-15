// ข้อมูลติดต่อผู้ขาย — GET /products/:id/contact (FR-06, Spec §8.1)
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

export const SAFETY_NOTE =
  'นัดรับในพื้นที่จุฬาฯ ช่วงเวลากลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง';

// คอลัมน์ users ที่ endpoint นี้อ่าน (ห้าม users(*) และห้ามส่ง email ออกไป)
export const CONTACT_SELECT =
  'pickup_location, seller:users(user_id, full_name, faculty, phone_number, line_id)';

export const lineDeepLink = (lineId) => `https://line.me/ti/p/~${encodeURIComponent(lineId)}`;

// 0812345678 -> tel:+66812345678 · +66812345678 คงเดิม (DB บังคับรูปแบบ ^(0|\+66)[0-9]{8,9}$)
export function phoneDeepLink(phone) {
  const value = String(phone).trim();
  if (value.startsWith('0')) return `tel:+66${value.slice(1)}`;
  return `tel:${value}`;
}

// เฉพาะช่องทางที่ผู้ขายกรอกไว้ (FR-06 ข้อ 3) · LINE เป็นช่องทางหลักถ้ามี
export function buildChannels(seller) {
  const channels = [];
  if (seller?.line_id) {
    channels.push({
      type: 'line',
      value: seller.line_id,
      deep_link: lineDeepLink(seller.line_id),
      is_primary: true,
    });
  }
  if (seller?.phone_number) {
    channels.push({
      type: 'phone',
      value: seller.phone_number,
      deep_link: phoneDeepLink(seller.phone_number),
      is_primary: channels.length === 0,
    });
  }
  return channels;
}

// แถวจาก CONTACT_SELECT -> response ตาม Spec §8.1 (ชื่อเต็ม เพราะผู้ขอล็อกอินแล้ว)
export function toContact(row) {
  return {
    seller: {
      user_id: row.seller?.user_id,
      full_name: row.seller?.full_name,
      faculty: row.seller?.faculty ?? null,
    },
    channels: buildChannels(row.seller),
    pickup_location: row.pickup_location,
    safety_note: SAFETY_NOTE,
  };
}
