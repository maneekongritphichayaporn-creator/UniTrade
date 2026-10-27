'use client';

// หน้ารายละเอียดสินค้า (TASK-18 — ส่วนแสดงผลและปุ่มติดต่อผู้ขาย)
// ข้อมูลมาจาก GET /products/:id ซึ่ง "ไม่มี" เบอร์โทร/LINE ของผู้ขายตาม FR-06
// ไม่พบสินค้า getProduct() จะคืน null (รองรับทั้ง 200 + data: [] และ 404 PRODUCT_NOT_FOUND)

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ImageIcon, MapPinIcon } from '@/components/ui/icons.js';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { categoryLabel, conditionLabel, formatDate, formatPrice, formatRelativeTime } from '@/lib/client/format.js';
import { getProduct } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { ContactSellerButton } from './ContactSellerButton.js';
import { StatusBadge } from './StatusBadge.js';
import styles from './ProductDetailView.module.css';

const PLACEHOLDER = '/placeholder-product.svg';

const STATUS_NOTE = {
  reserved: 'สินค้านี้ติดจองอยู่ ผู้ขายอาจยังเปิดรับผู้สนใจรายอื่น',
  sold: 'สินค้านี้ขายไปแล้ว',
};

export function ProductDetailView({ productId }) {
  const [state, setState] = useState({ status: 'loading', product: null, error: null });
  const [activeImage, setActiveImage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', product: null, error: null });
    setActiveImage(0);

    getProduct(productId, { signal: controller.signal })
      .then((product) => {
        setState(
          product
            ? { status: 'ready', product, error: null }
            : { status: 'not-found', product: null, error: null },
        );
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ status: 'error', product: null, error });
      });

    return () => controller.abort();
  }, [productId, reloadToken]);

  if (state.status === 'loading') return <DetailSkeleton />;

  if (state.status === 'error') {
    return (
      <div className={`container ${styles.page}`}>
        <ErrorState error={state.error} onRetry={load} />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className={`container ${styles.notFound}`}>
        <h1 className={styles.notFoundTitle}>ไม่พบสินค้านี้</h1>
        <p className="muted">สินค้าอาจถูกลบหรือขายไปแล้ว</p>
        <Link href={routes.home} className="btn btn--primary btn--lg" style={{ marginTop: 20 }}>
          กลับไปหน้าแรก
        </Link>
      </div>
    );
  }

  const product = state.product;
  const images = product.images?.length ? product.images : [{ image_id: 'placeholder', image_url: PLACEHOLDER }];
  const statusNote = STATUS_NOTE[product.status];

  return (
    <div className={`container ${styles.page}`}>
      <Link href={routes.home} className={styles.back}>
        <ChevronLeftIcon size={16} />
        กลับไปหน้าแรก
      </Link>

      <div className={styles.layout}>
        <div>
          <div className={styles.mainImage}>
            <img src={images[activeImage]?.image_url ?? PLACEHOLDER} alt={product.title} />
          </div>

          {images.length > 1 && (
            <ul className={styles.thumbs}>
              {images.map((image, index) => (
                <li key={image.image_id}>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-current={index === activeImage}
                    aria-label={`รูปที่ ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image.image_url} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.imageCount}>
            <ImageIcon size={14} />
            {images.length} รูป
          </p>
        </div>

        <div className={styles.info}>
          <div className={styles.badges}>
            <StatusBadge status={product.status} />
            <span className="badge">{categoryLabel(product.category)}</span>
            <span className="badge">สภาพ: {conditionLabel(product.item_condition)}</span>
          </div>

          <h1 className={styles.title}>{product.title}</h1>

          <p className={product.is_free ? styles.priceFree : styles.price}>
            {formatPrice(product.price, product.is_free)}
          </p>

          {statusNote && <p className={styles.statusNote}>{statusNote}</p>}

          <p className={styles.pickup}>
            <MapPinIcon size={18} />
            <span>
              นัดรับที่ <strong>{product.pickup_location}</strong>
            </span>
          </p>

          <p className={styles.posted}>ลงประกาศ {formatRelativeTime(product.created_at)}</p>

          <div className={styles.contact}>
            <ContactSellerButton productId={product.product_id} />
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>รายละเอียด</h2>
            <p className={styles.description}>
              {product.description || <span className="muted">ผู้ขายไม่ได้ระบุรายละเอียดเพิ่มเติม</span>}
            </p>
          </section>

          <section className={`card ${styles.seller}`}>
            <h2 className={styles.sectionTitle}>ผู้ขาย</h2>
            <div className={styles.sellerRow}>
              <span className={styles.sellerAvatar} aria-hidden="true">
                {(product.seller?.full_name ?? '?').trim().charAt(0)}
              </span>
              <div>
                <p className={styles.sellerName}>{product.seller?.full_name}</p>
                {product.seller?.faculty && <p className={styles.sellerMeta}>{product.seller.faculty}</p>}
              </div>
            </div>
            <dl className={styles.sellerStats}>
              <div>
                <dt>ประกาศที่ยังขายอยู่</dt>
                <dd>{product.seller?.active_listings ?? 0} รายการ</dd>
              </div>
              {product.seller?.created_at && (
                <div>
                  <dt>เป็นสมาชิกตั้งแต่</dt>
                  <dd>{formatDate(product.seller.created_at)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        <div className={`skeleton ${styles.mainImage}`} />
        <div className={styles.info}>
          <div className="skeleton" style={{ width: 160, height: 24 }} />
          <div className="skeleton" style={{ width: '85%', height: 28, marginTop: 14 }} />
          <div className="skeleton" style={{ width: 120, height: 30, marginTop: 14 }} />
          <div className="skeleton" style={{ width: '100%', height: 48, marginTop: 24, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: '100%', height: 90, marginTop: 24 }} />
        </div>
      </div>
    </div>
  );
}
