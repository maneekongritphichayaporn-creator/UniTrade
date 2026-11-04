import { ProductCard } from './ProductCard.js';
import styles from './ProductGrid.module.css';

export function ProductGrid({ products }) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.product_id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

/** โครงการ์ดเปล่าระหว่างรอ API ตอบ กันหน้าเว็บกระพริบ/เลย์เอาต์กระโดด */
export function ProductGridSkeleton({ count = 12 }) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.skeletonCard}>
          <div className={`skeleton ${styles.skeletonThumb}`} />
          <div className={styles.skeletonBody}>
            <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '45%' }} />
            <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '90%' }} />
            <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '35%', height: 16 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
