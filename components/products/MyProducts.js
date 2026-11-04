'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon } from '@/components/ui/icons.js';
import { Modal } from '@/components/ui/Modal.js';
import { categoryLabel, formatPrice, statusLabel } from '@/lib/client/format.js';
import { listMyProducts, updateProductStatus } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './MyProducts.module.css';

const STATUSES = ['available', 'reserved', 'sold'];

export function MyProducts() {
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [confirmSold, setConfirmSold] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const grouped = useMemo(() => Object.fromEntries(
    STATUSES.map((status) => [status, products.filter((item) => item.status === status)]),
  ), [products]);

  useEffect(() => {
    if (authStatus === 'guest') router.replace(routes.login(routes.myProducts));
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user?.user_id) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    listMyProducts(user.user_id, { signal: controller.signal })
      .then((items) => { setProducts(items); setLoading(false); })
      .catch((err) => { if (err.name !== 'AbortError') { setError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, [authStatus, user?.user_id]);

  async function changeStatus(productId, nextStatus) {
    const item = products.find((product) => product.product_id === productId);
    if (!item || item.status === nextStatus || pendingId) return;
    const previousStatus = item.status;
    setPendingId(productId);
    setError('');
    setMessage('');
    setProducts((current) => current.map((product) => product.product_id === productId
      ? { ...product, status: nextStatus } : product));
    try {
      await updateProductStatus(productId, nextStatus);
      setMessage(`เปลี่ยนสถานะ “${item.title}” เป็น ${statusLabel(nextStatus)} แล้ว`);
    } catch (err) {
      setProducts((current) => current.map((product) => product.product_id === productId
        ? { ...product, status: previousStatus } : product));
      setError(err.message || 'เปลี่ยนสถานะไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setPendingId(null);
      setConfirmSold(null);
    }
  }

  function selectStatus(item, nextStatus) {
    if (nextStatus === item.status || pendingId) return;
    if (nextStatus === 'sold') setConfirmSold(item);
    else changeStatus(item.product_id, nextStatus);
  }

  if (authStatus === 'loading' || authStatus === 'guest') {
    return <p className={styles.notice}>กำลังตรวจสอบการเข้าสู่ระบบ…</p>;
  }

  return <div className={styles.page}>
    <div className={styles.heading}>
      <div><h1>My Listings</h1><p>จัดการประกาศสินค้าของคุณ</p></div>
      <Link href={routes.createProduct} className="btn btn--primary">+ ลงขายสินค้า</Link>
    </div>

    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.message} role="status">{message}</p>}
    {loading ? <p className={styles.notice}>กำลังโหลดประกาศ…</p>
      : STATUSES.map((status) => <section key={status} className={styles.section}>
        <h2>{statusLabel(status)} ({grouped[status].length})</h2>
        <div className={styles.grid}>
          {grouped[status].map((item) => <article className={styles.card} key={item.product_id}>
            <Link href={routes.product(item.product_id)} className={styles.image} aria-label={`ดู ${item.title}`}>
              {item.primary_image_url ? <img src={item.primary_image_url} alt={item.title} /> : <ImageIcon size={55} />}
            </Link>
            <span className={`${styles.badge} ${styles[item.status]}`}>{statusLabel(item.status)}</span>
            <h3><Link href={routes.product(item.product_id)}>{item.title}</Link></h3>
            <strong className={styles.price}>{formatPrice(item.price, item.is_free)}</strong>
            <p className={styles.category}>หมวดหมู่: {categoryLabel(item.category)}</p>
            <label className={styles.statusSelect}>สถานะสินค้า
              <select value={item.status} disabled={pendingId !== null}
                onChange={(event) => selectStatus(item, event.target.value)} aria-label={`เปลี่ยนสถานะ ${item.title}`}>
                {STATUSES.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
              </select>
            </label>
            <Link href={routes.editProduct(item.product_id)} className={styles.edit}>แก้ไขประกาศ</Link>
          </article>)}
          {!grouped[status].length && <p className={styles.empty}>ยังไม่มีสินค้าในสถานะนี้</p>}
        </div>
      </section>)}

    {confirmSold && <Modal title="ยืนยันการขายสินค้า" onClose={() => { if (!pendingId) setConfirmSold(null); }}
      footer={<div className={styles.modalActions}>
        <button type="button" className="btn btn--outline" disabled={Boolean(pendingId)} onClick={() => setConfirmSold(null)}>ยกเลิก</button>
        <button type="button" className="btn btn--primary" disabled={Boolean(pendingId)}
          onClick={() => changeStatus(confirmSold.product_id, 'sold')}>
          {pendingId ? 'กำลังบันทึก…' : 'ยืนยันว่าขายแล้ว'}
        </button>
      </div>}>
      <p>เปลี่ยนสถานะ “{confirmSold.title}” เป็นขายแล้ว?</p>
    </Modal>}
  </div>;
}
