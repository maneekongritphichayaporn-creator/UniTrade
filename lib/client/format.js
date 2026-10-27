// ข้อความและรูปแบบตัวเลขที่ใช้แสดงผล — ภาษาไทยทั้งหมด

export const STATUS_LABELS = {
  available: 'พร้อมขาย',
  reserved: 'ติดจอง',
  sold: 'ขายแล้ว',
};

export const ITEM_CONDITIONS = ['new', 'like_new', 'good', 'fair'];

export const ITEM_CONDITION_LABELS = {
  new: 'ใหม่',
  like_new: 'เหมือนใหม่',
  good: 'สภาพดี',
  fair: 'พอใช้',
};

export const SORT_OPTIONS = [
  { value: 'date_desc', label: 'ใหม่ล่าสุด' },
  { value: 'date_asc', label: 'เก่าสุด' },
  { value: 'price_asc', label: 'ราคาต่ำไปสูง' },
  { value: 'price_desc', label: 'ราคาสูงไปต่ำ' },
];

// GET /categories ส่ง name เป็นภาษาอังกฤษ (ตาม seed) หน้าเว็บแสดงภาษาไทย
// category_id เป็นค่าคงที่ตาม supabase/seed.sql — ถ้าเจอ id ที่ไม่รู้จักจะใช้ name จาก API แทน
export const CATEGORY_LABELS_TH = {
  '00000000-0000-4000-8000-000000000001': 'หนังสือเรียน/ชีท',
  '00000000-0000-4000-8000-000000000002': 'อุปกรณ์การเรียน',
  '00000000-0000-4000-8000-000000000003': 'เครื่องแต่งกาย',
  '00000000-0000-4000-8000-000000000004': 'ของใช้ในหอพัก',
  '00000000-0000-4000-8000-000000000005': 'ไอทีและแกดเจ็ต',
  '00000000-0000-4000-8000-000000000006': 'อื่น ๆ',
};

export function categoryLabel(category) {
  if (!category) return '';
  return CATEGORY_LABELS_TH[category.category_id] ?? category.name ?? '';
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

export function conditionLabel(condition) {
  return ITEM_CONDITION_LABELS[condition] ?? condition;
}

const priceFormat = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** ราคา 0 บาทคือของแจกฟรี (is_free คิดจาก price === 0 ที่ฝั่ง API) */
export function formatPrice(price, isFree) {
  if (isFree ?? Number(price) === 0) return 'แจกฟรี';
  return `฿${priceFormat.format(Number(price))}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "3 ชั่วโมงก่อน" / "2 วันก่อน" — เกิน 30 วันแสดงเป็นวันที่ */
export function formatRelativeTime(isoString) {
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Date.now() - time;
  if (diff < MINUTE) return 'เมื่อสักครู่';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} นาทีก่อน`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ชั่วโมงก่อน`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} วันก่อน`;
  return formatDate(isoString);
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}
