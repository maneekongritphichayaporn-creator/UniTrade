'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon } from '@/components/ui/icons.js';
import { categoryLabel, formatPrice, statusLabel } from '@/lib/client/format.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import { getWishlist, removeWishlist } from '@/lib/client/wishlist.js';
import styles from './WishlistPage.module.css';

export function WishlistPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'guest') router.replace(routes.login(routes.wishlist));
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const controller = new AbortController();
    setLoading(true);
    getWishlist({ signal: controller.signal })
      .then((body) => { setItems(body.data); setLoading(false); })
      .catch((err) => { if (err.name !== 'AbortError') { setError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, [status]);

  async function remove(item) {
    if (pendingId) return;
    const before = items;
    setPendingId(item.product_id);
    setError('');
    setItems((current) => current.filter((product) => product.product_id !== item.product_id));
    try { await removeWishlist(item.product_id); }
    catch (err) {
      setItems(before);
      setError(err.message || 'นำสินค้าออกจากรายการโปรดไม่สำเร็จ');
    } finally { setPendingId(null); }
  }

  if (status === 'loading' || status === 'guest') return <p className={styles.notice}>กำลังตรวจสอบการเข้าสู่ระบบ…</p>;

  return <section className={styles.page}>
    <div className={styles.heading}><h1>รายการโปรดของฉัน</h1><p>สินค้าที่คุณบันทึกไว้</p></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {loading ? <p className={styles.notice}>กำลังโหลดรายการโปรด…</p>
      : !items.length ? <div className={styles.notice}><p>ยังไม่มีสินค้าในรายการโปรด</p><Link href={routes.home}>ไปเลือกดูสินค้า</Link></div>
      : <div className={styles.grid}>{items.map((item) => <article className={styles.card} key={item.product_id}>
        <Link href={routes.product(item.product_id)} className={styles.image}>
          {item.primary_image_url ? <img src={item.primary_image_url} alt={item.title} /> : <ImageIcon size={64} />}
        </Link>
        <button type="button" className={styles.remove} aria-label={`นำ ${item.title} ออกจากรายการโปรด`}
          disabled={Boolean(pendingId)} onClick={() => remove(item)}>×</button>
        <span className={`${styles.status} ${styles[item.status]}`}>{statusLabel(item.status)}</span>
        <h2><Link href={routes.product(item.product_id)}>{item.title}</Link></h2>
        <strong>{formatPrice(item.price, item.is_free)}</strong>
        <p>หมวดหมู่: {categoryLabel(item.category)}</p>
      </article>)}</div>}
  </section>;
}
