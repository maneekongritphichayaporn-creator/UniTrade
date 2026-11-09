'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/client/auth.js';
import { routes, safeNextPath } from '@/lib/client/routes.js';

export function LoginPlaceholder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(email, password);
      router.replace(safeNextPath(searchParams.get('next')) ?? routes.home);
      router.refresh();
    } catch (loginError) {
      setError(loginError?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingBlock: 48 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1>เข้าสู่ระบบ</h1>
        <p className="muted" style={{ marginTop: 8 }}>ใช้อีเมลจุฬาฯ เพื่อเข้าสู่ UniTrade</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <label className="label" htmlFor="login-email">อีเมล</label>
          <input className="input" id="login-email" type="email" autoComplete="email" required
            value={email} onChange={(event) => setEmail(event.target.value)}
            placeholder="name@student.chula.ac.th" />

          <label className="label" htmlFor="login-password" style={{ marginTop: 16 }}>รหัสผ่าน</label>
          <input className="input" id="login-password" type="password" autoComplete="current-password" required
            value={password} onChange={(event) => setPassword(event.target.value)} />

          {error && <p role="alert" style={{ color: '#b42318', marginTop: 12 }}>{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={pending} style={{ marginTop: 24 }}>
            {pending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center' }}>
          ยังไม่มีบัญชี? <Link href={routes.register} style={{ color: 'var(--brand-600)' }}>สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
