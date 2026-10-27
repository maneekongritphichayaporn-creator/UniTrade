'use client';

// ปุ่มติดต่อผู้ขาย (TASK-18)
// ยังไม่ล็อกอิน: พาไปหน้าเข้าสู่ระบบ พร้อมจำหน้าที่ค้างไว้ใน ?next= เพื่อกลับมาที่เดิม
// ล็อกอินแล้ว: ยิง GET /products/:id/contact (แนบ Bearer token ให้อัตโนมัติ) แล้วเปิด modal
// ข้อมูลติดต่อไม่อยู่ใน GET /products/:id เพื่อไม่ให้เบอร์โทร/LINE หลุดสู่สาธารณะ (FR-06)

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatIcon, UserIcon } from '@/components/ui/icons.js';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { getProductContact } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import { SellerContactModal } from './SellerContactModal.js';

export function ContactSellerButton({ productId }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'loading') {
    return <div className="skeleton" style={{ height: 48, borderRadius: 999 }} aria-hidden="true" />;
  }

  if (status === 'guest') {
    return (
      <Link href={routes.login(pathname)} className="btn btn--primary btn--lg btn--block">
        <UserIcon size={18} />
        เข้าสู่ระบบด้วยอีเมลจุฬาฯ เพื่อดูข้อมูลติดต่อ
      </Link>
    );
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      setContact(await getProductContact(productId));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--primary btn--lg btn--block"
        onClick={handleClick}
        disabled={loading}
      >
        <ChatIcon size={18} />
        {loading ? 'กำลังโหลด…' : 'ติดต่อผู้ขาย'}
      </button>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorState error={error} onRetry={handleClick} />
        </div>
      )}

      {contact && <SellerContactModal contact={contact} onClose={() => setContact(null)} />}
    </>
  );
}
