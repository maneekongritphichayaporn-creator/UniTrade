'use client';

import { useSyncExternalStore } from 'react';
import { getSession, subscribeSession } from './session.js';

// ตอน render ฝั่งเซิร์ฟเวอร์ยังไม่รู้ว่าใครล็อกอิน (token อยู่ใน localStorage)
// จึงคืน undefined ไว้ก่อน แล้วให้ status เป็น 'loading' เพื่อไม่ให้ HTML สองฝั่งไม่ตรงกัน
const getServerSnapshot = () => undefined;

/**
 * สถานะการล็อกอินของหน้าเว็บ
 * @returns {{ status: 'loading'|'guest'|'authenticated', user: object|null, isAdmin: boolean }}
 */
export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSnapshot);

  if (session === undefined) return { status: 'loading', user: null, isAdmin: false };
  if (!session) return { status: 'guest', user: null, isAdmin: false };
  return {
    status: 'authenticated',
    user: session.user,
    isAdmin: session.user?.role === 'admin',
  };
}
