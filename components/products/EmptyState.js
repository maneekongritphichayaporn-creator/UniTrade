import { PackageIcon } from '@/components/ui/icons.js';
import styles from './EmptyState.module.css';

/**
 * ไม่พบสินค้า — ไม่ใช่ error (API ตอบ 200 พร้อม data: [] และ message)
 * ใช้ message จาก API ถ้ามี เพื่อให้ข้อความตรงกับที่ backend กำหนด
 */
export function EmptyState({ message, hasFilters, onReset }) {
  return (
    <div className={styles.box}>
      <span className={styles.icon} aria-hidden="true">
        <PackageIcon size={28} />
      </span>
      <p className={styles.title}>{message || 'ไม่พบสินค้าที่ตรงกับเงื่อนไข'}</p>
      <p className={styles.hint}>
        {hasFilters
          ? 'ลองลดตัวกรองลง หรือเปลี่ยนคำค้นหาใหม่'
          : 'ยังไม่มีประกาศในระบบ ลองกลับมาดูอีกครั้งภายหลัง'}
      </p>
      {hasFilters && (
        <button type="button" className="btn btn--outline" onClick={onReset}>
          ล้างตัวกรองทั้งหมด
        </button>
      )}
    </div>
  );
}
