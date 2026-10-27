'use client';

// เปลี่ยนหน้าตาม pagination ที่ API ส่งมา (TASK-10)
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons.js';
import styles from './Pagination.module.css';

/** เลขหน้าที่จะแสดง: หน้าแรก หน้าสุดท้าย และหน้าใกล้ ๆ หน้าปัจจุบัน ที่เหลือแทนด้วย … */
function pageItems(page, totalPages) {
  const visible =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [...new Set([1, totalPages, page, page - 1, page + 1])]
          .filter((value) => value >= 1 && value <= totalPages)
          .sort((a, b) => a - b);

  const items = [];
  let previous = 0;
  for (const value of visible) {
    if (previous && value - previous > 1) items.push({ gap: true, key: `gap-${value}` });
    items.push({ page: value, key: value });
    previous = value;
  }
  return items;
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const items = pageItems(page, totalPages);

  return (
    <nav className={styles.nav} aria-label="เปลี่ยนหน้า">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="หน้าก่อนหน้า"
      >
        <ChevronLeftIcon size={18} />
      </button>

      <ul className={styles.pages}>
        {items.map((item) =>
          item.gap ? (
            <li key={item.key} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item.key}>
              <button
                type="button"
                className={styles.page}
                aria-current={item.page === page ? 'page' : undefined}
                onClick={() => onChange(item.page)}
              >
                {item.page}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="หน้าถัดไป"
      >
        <ChevronRightIcon size={18} />
      </button>
    </nav>
  );
}
