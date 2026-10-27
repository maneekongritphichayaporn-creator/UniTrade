'use client';

// แถบหมวดหมู่ 6 หมวด (TASK-10) — ดึงจาก GET /categories, เลือกได้หลายหมวดพร้อมกัน
// ค่าที่เลือกเก็บใน ?category_id=uuid1,uuid2 ซึ่งเป็นรูปแบบที่ API รับอยู่แล้ว

import { categoryLabel } from '@/lib/client/format.js';
import styles from './CategoryBar.module.css';

export function CategoryBar({ categories, selectedIds, onToggle, onClear, loading }) {
  if (loading) {
    return (
      <div className={styles.bar} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`skeleton ${styles.skeletonPill}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.bar} role="group" aria-label="กรองตามหมวดหมู่">
      <button
        type="button"
        className={styles.pill}
        aria-pressed={selectedIds.length === 0}
        onClick={onClear}
      >
        ทั้งหมด
      </button>

      {categories.map((category) => {
        const selected = selectedIds.includes(category.category_id);
        return (
          <button
            key={category.category_id}
            type="button"
            className={styles.pill}
            aria-pressed={selected}
            onClick={() => onToggle(category.category_id)}
            title={category.description}
          >
            {categoryLabel(category)}
            {typeof category.product_count === 'number' && (
              <span className={styles.count}>{category.product_count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
