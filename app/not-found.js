import Link from 'next/link';
import { routes } from '@/lib/client/routes.js';

// หน้านี้ขึ้นเมื่อ path ไม่ตรงกับหน้าใดเลย รวมถึงหน้าที่ทีมยังไม่ได้ทำ
export default function NotFound() {
  return (
    <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
      <p style={{ color: 'var(--brand-500)', fontSize: 48, fontWeight: 700, lineHeight: 1 }}>404</p>
      <h1 style={{ marginTop: 12, fontSize: 22 }}>ไม่พบหน้านี้</h1>
      <p className="muted" style={{ marginTop: 8 }}>
        หน้านี้อาจถูกย้าย ถูกลบ หรือยังอยู่ระหว่างการพัฒนา
      </p>
      <Link href={routes.home} className="btn btn--primary btn--lg" style={{ marginTop: 24 }}>
        กลับไปหน้าแรก
      </Link>
    </div>
  );
}
