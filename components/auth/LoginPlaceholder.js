'use client';

/**
 * หน้าเข้าสู่ระบบตัวชั่วคราว
 *
 * ของจริงเป็น TASK-08 ของ @warixm — ไฟล์นี้วางไว้เพื่อให้ปุ่ม "เข้าสู่ระบบ" และ
 * ปุ่มติดต่อผู้ขาย (TASK-18) มีปลายทางให้ไปตั้งแต่ตอนนี้ แทนที่ได้ทั้งไฟล์เลย
 * สิ่งที่ TASK-08 ต้องทำต่อ: ฟอร์มอีเมล/รหัสผ่านจริง ยิง POST /auth/login
 * แล้วเก็บ session ด้วย login() จาก lib/client/auth.js (ตัวนี้จัดการ token ให้แล้ว)
 *
 * ตอนเปิดโหมดข้อมูลจำลองจะมีปุ่มล็อกอินด้วยบัญชีทดสอบให้กดเพื่อเดโมหน้าอื่น ๆ
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { login } from '@/lib/client/auth.js';
import { USE_MOCK_API } from '@/lib/client/config.js';
import { routes, safeNextPath } from '@/lib/client/routes.js';

const TEST_ACCOUNTS = [
  { label: 'นิสิต (member)', email: 'nisit.k@student.chula.ac.th', password: 'UniTrade2026!' },
  { label: 'ผู้ดูแลระบบ (admin)', email: 'admin@chula.ac.th', password: 'Admin2026!' },
];

export function LoginPlaceholder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [pending, setPending] = useState('');

  const next = safeNextPath(searchParams.get('next')) ?? routes.home;

  async function signIn(account) {
    setPending(account.email);
    setError(null);
    try {
      await login(account.email, account.password);
      router.replace(next);
    } catch (loginError) {
      setError(loginError);
    } finally {
      setPending('');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, padding: '48px 16px' }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20 }}>เข้าสู่ระบบ</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
          ใช้อีเมลจุฬาฯ (@student.chula.ac.th หรือ @chula.ac.th) เพื่อดูข้อมูลติดต่อผู้ขายและลงขายสินค้า
        </p>

        <p
          style={{
            marginTop: 20,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--brand-50)',
            color: 'var(--brand-700)',
            fontSize: 13,
          }}
        >
          หน้านี้ยังเป็นตัวชั่วคราว ฟอร์มจริงอยู่ใน TASK-08 (ผู้รับผิดชอบ: @warixm)
        </p>

        {USE_MOCK_API && (
          <div style={{ marginTop: 20 }}>
            <p className="label">เข้าสู่ระบบด้วยบัญชีทดสอบ (โหมดข้อมูลจำลอง)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEST_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="btn btn--outline btn--block"
                  disabled={Boolean(pending)}
                  onClick={() => signIn(account)}
                >
                  {pending === account.email ? 'กำลังเข้าสู่ระบบ…' : account.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16 }}>
            <ErrorState error={error} />
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 13 }}>
          <Link href={routes.home} style={{ color: 'var(--brand-600)' }}>
            กลับไปหน้าแรก
          </Link>
        </p>
      </div>
    </div>
  );
}
