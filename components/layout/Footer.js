import Link from 'next/link';
import { ShieldIcon } from '@/components/ui/icons.js';
import { routes } from '@/lib/client/routes.js';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div>
            <p className={styles.brand}>UniTrade</p>
            <p className={styles.tagline}>
              ตลาดซื้อขายและส่งต่อของมือสองสำหรับนิสิตและบุคลากรจุฬาฯ
            </p>
          </div>

          <nav className={styles.links} aria-label="ลิงก์ในเว็บไซต์">
            <Link href={routes.home}>ค้นหาสินค้า</Link>
            <Link href={routes.createProduct}>ลงขายสินค้า</Link>
            <Link href={routes.wishlist}>รายการโปรด</Link>
          </nav>

          <p className={styles.safety}>
            <ShieldIcon size={16} />
            นัดรับในพื้นที่จุฬาฯ ช่วงกลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง
          </p>
        </div>

        <p className={styles.copy}>
          โปรเจกต์รายวิชาวิศวกรรมซอฟต์แวร์ · กลุ่ม VISIT CMU · ไม่มีระบบชำระเงินในเว็บ
        </p>
      </div>
    </footer>
  );
}
