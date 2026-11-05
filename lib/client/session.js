// เก็บ token กับข้อมูลผู้ใช้ไว้ใน localStorage (API เราไม่มี refresh token อายุ 24 ชม.)
// ทุกการอ่าน/เขียนครอบ try/catch เพราะโหมดส่วนตัวของเบราว์เซอร์อาจปิด localStorage ไว้

const STORAGE_KEY = 'unitrade.session';
const SIGNED_OUT_KEY = 'unitrade.signed-out';

const listeners = new Set();

// cache ไว้เทียบ raw string เดิม เพื่อให้ getSession() คืน object เดิม
// (useSyncExternalStore จะ re-render ไม่หยุดถ้า snapshot เป็น object ใหม่ทุกครั้ง)
let cachedRaw = null;
let cachedSession = null;

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** คืน session ที่ยังไม่หมดอายุ หรือ null */
export function getSession() {
  if (typeof window === 'undefined') return null;

  const raw = readRaw();
  if (!raw) {
    cachedRaw = null;
    cachedSession = null;
    return null;
  }
  if (raw === cachedRaw) return cachedSession;

  let session = null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user) session = parsed;
  } catch {
    session = null;
  }

  // หมดอายุแล้วถือว่าไม่ได้ล็อกอิน และล้างทิ้งเลย
  if (session?.expiresAt && Date.now() >= session.expiresAt) {
    clearSession('expired');
    return null;
  }

  cachedRaw = raw;
  cachedSession = session;
  return session;
}

export function getToken() {
  return getSession()?.token ?? null;
}

/** บันทึก session จาก response ของ POST /auth/login */
export function setSession({ token, expires_in: expiresIn, user }) {
  const session = {
    token,
    user,
    expiresAt: Date.now() + (Number(expiresIn) || 86_400) * 1000,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.localStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    // เขียนไม่ได้ก็ยังใช้งานต่อได้ในแท็บนี้ แค่จะไม่จำเมื่อรีเฟรช
  }
  notify();
  return session;
}

/**
 * ออกจากระบบ
 * reason 'signed-out' = ผู้ใช้กดเอง · 'expired' = token หมดอายุหรือ API ตอบ 401
 * ใช้แยกว่าจะพากลับหน้าแรกหรือพาไปหน้าเข้าสู่ระบบ
 */
export function clearSession(reason = 'signed-out') {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.setItem(SIGNED_OUT_KEY, reason);
  } catch {
    // ไม่เป็นไร
  }
  cachedRaw = null;
  cachedSession = null;
  notify();
}

export function wasSignedOutByUser() {
  try {
    return window.localStorage.getItem(SIGNED_OUT_KEY) === 'signed-out';
  } catch {
    return false;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

/** ให้ useSyncExternalStore ติดตามการเปลี่ยนแปลง (รวมถึงการล็อกอิน/ออกจากแท็บอื่น) */
export function subscribeSession(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedRaw = null;
      cachedSession = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
