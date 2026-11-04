import { ShieldIcon } from '@/components/ui/icons.js';
import styles from './ErrorState.module.css';

/** แสดง error.message จาก API ได้ตรง ๆ เพราะ backend ส่งข้อความภาษาไทยมาให้แล้ว */
export function ErrorState({ error, onRetry }) {
  return (
    <div className={styles.box} role="alert">
      <span className={styles.icon} aria-hidden="true">
        <ShieldIcon size={24} />
      </span>
      <div>
        <p className={styles.title}>โหลดข้อมูลไม่สำเร็จ</p>
        <p className={styles.message}>{error?.message || 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'}</p>
        {error?.code && <p className={styles.code}>รหัส: {error.code}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}
