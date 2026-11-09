import Link from 'next/link';
import { MapPinIcon } from '@/components/ui/icons.js';
import { categoryLabel, conditionLabel, formatPrice, formatRelativeTime } from '@/lib/client/format.js';
import { routes } from '@/lib/client/routes.js';
import { StatusBadge } from './StatusBadge.js';
import { WishlistButton } from './WishlistButton.js';
import styles from './ProductCard.module.css';

const PLACEHOLDER = '/placeholder-product.svg';

/** การ์ดสินค้า 1 ชิ้น — รับ object ตามรูปแบบ "product card" ของ GET /products */
export function ProductCard({ product }) {
  const { product_id: id, title, price, is_free: isFree, status, pickup_location: pickup } = product;

  return (
    <article className={styles.card}>
      <Link href={routes.product(id)} className={styles.link}>
        <div className={styles.thumb}>
          <img
            src={product.primary_image_url || PLACEHOLDER}
            alt={title}
            loading="lazy"
            className={styles.image}
          />
          {status !== 'available' && (
            <span className={styles.statusOverlay}>
              <StatusBadge status={status} />
            </span>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.meta}>
            <span>{categoryLabel(product.category)}</span>
            <span aria-hidden="true">·</span>
            <span>{conditionLabel(product.item_condition)}</span>
          </div>

          <h3 className={styles.title}>{title}</h3>

          <p className={isFree ? styles.priceFree : styles.price}>{formatPrice(price, isFree)}</p>

          <p className={styles.pickup}>
            <MapPinIcon size={14} />
            <span className={styles.pickupText}>{pickup}</span>
          </p>

          <p className={styles.time}>{formatRelativeTime(product.created_at)}</p>
        </div>
      </Link>
      <WishlistButton productId={id} initialSaved={product.is_wishlisted} compact className={styles.heart} />
    </article>
  );
}
