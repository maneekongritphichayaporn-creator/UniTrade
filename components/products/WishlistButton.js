'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon } from '@/components/ui/icons.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import { toggleWishlist } from '@/lib/client/wishlist.js';
import styles from './WishlistButton.module.css';

export function WishlistButton({ productId, initialSaved = false, compact = false, className = '' }) {
  const router = useRouter();
  const { status } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setSaved(initialSaved), [initialSaved]);

  async function click(event) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    if (status !== 'authenticated') {
      setMessage('กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้า');
      const next = window.location.pathname + window.location.search;
      window.setTimeout(() => router.push(routes.login(next)), 900);
      return;
    }
    setPending(true);
    setMessage('');
    try {
      const result = await toggleWishlist(productId);
      setSaved(result.action === 'added');
    } catch (error) { setMessage(error.message || 'บันทึกรายการโปรดไม่สำเร็จ'); }
    finally { setPending(false); }
  }

  return <div className={`${styles.wrap} ${className}`}>
    <button type="button" className={`${styles.button} ${saved ? styles.saved : ''} ${compact ? styles.compact : ''}`}
      onClick={click} disabled={pending} aria-pressed={saved}
      aria-label={saved ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}>
      <HeartIcon size={compact ? 20 : 18} filled={saved} />
      {!compact && <span>{saved ? 'บันทึกแล้ว' : 'บันทึกสินค้า'}</span>}
    </button>
    {message && <span className={styles.message} role="alert">{message}</span>}
  </div>;
}
