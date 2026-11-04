'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ImageIcon } from '@/components/ui/icons.js';
import { getProduct } from '@/lib/client/products.js';
import { categoryLabel, conditionLabel, formatDate, formatPrice, statusLabel } from '@/lib/client/format.js';
import { routes } from '@/lib/client/routes.js';
import { WishlistButton } from './WishlistButton.js';
import styles from './ProductDetail.module.css';

export function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState('loading');
    setError('');
    setSelectedImage(0);
    getProduct(productId, { signal: controller.signal })
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setState(data ? 'ready' : 'not-found');
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        setError(err.message || 'โหลดรายละเอียดสินค้าไม่สำเร็จ');
        setState('error');
      });
    return () => { active = false; controller.abort(); };
  }, [productId]);

  if (state === 'loading') return <p className={styles.notice}>กำลังโหลดรายละเอียดสินค้า…</p>;
  if (state === 'error') return <div className={styles.notice} role="alert"><p>{error}</p><Link href={routes.home}>กลับหน้าแรก</Link></div>;
  if (state === 'not-found') return <div className={styles.notice}><h1>ไม่พบสินค้านี้</h1><Link href={routes.home}>กลับหน้าแรก</Link></div>;

  const images = product.images ?? [];
  const currentImage = images[selectedImage] ?? images[0];

  return <article className={styles.detail}>
    <section className={styles.overview}>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {currentImage ? <img src={currentImage.image_url} alt={`${product.title} รูปที่ ${selectedImage + 1}`} />
            : <ImageIcon size={96} />}
        </div>
        {images.length > 1 && <div className={styles.thumbnails} aria-label="เลือกรูปสินค้า">
          {images.map((image, index) => <button type="button" key={image.image_id}
            className={index === selectedImage ? styles.selected : ''}
            onClick={() => setSelectedImage(index)} aria-label={`ดูรูปที่ ${index + 1}`}
            aria-pressed={index === selectedImage}>
            <img src={image.image_url} alt="" />
          </button>)}
        </div>}
      </div>

      <div className={styles.summary}>
        <span className={`${styles.status} ${styles[product.status] ?? ''}`}>{statusLabel(product.status)}</span>
        <h1>{product.title}</h1>
        <strong className={styles.price}>{formatPrice(product.price, product.is_free)}</strong>
        <dl>
          <div><dt>สภาพสินค้า:</dt><dd>{conditionLabel(product.item_condition)}</dd></div>
          <div><dt>หมวดหมู่:</dt><dd>{categoryLabel(product.category)}</dd></div>
          <div><dt>สถานที่นัดรับ:</dt><dd>{product.pickup_location}</dd></div>
        </dl>
        <WishlistButton productId={product.product_id} initialSaved={product.is_wishlisted} />
        {product.is_owner && <Link className="btn btn--primary" href={routes.editProduct(product.product_id)}>แก้ไขประกาศ</Link>}
      </div>
    </section>

    <section className={styles.section}>
      <h2>รายละเอียดสินค้า</h2>
      <p>{product.description || 'ผู้ขายไม่ได้ระบุรายละเอียดเพิ่มเติม'}</p>
    </section>

    <section className={styles.sellerSection}>
      <div>
        <h2>ผู้ขาย</h2>
        <p className={styles.sellerName}>{product.seller?.full_name || 'ไม่ระบุชื่อ'}</p>
        {product.seller?.faculty && <p>คณะ: {product.seller.faculty}</p>}
        <p>ประกาศที่ยังขายอยู่: {product.seller?.active_listings ?? 0}</p>
      </div>
      <p className={styles.posted}>ลงประกาศ: {formatDate(product.created_at)}</p>
    </section>
  </article>;
}
