import Link from 'next/link';
import { routes } from '@/lib/client/routes.js';
import styles from './Logo.module.css';

export function Logo() {
  return (
    <Link href={routes.home} className={styles.logo} aria-label="UniTrade หน้าแรก">
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16l-1.4 12.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8z" />
          <path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7" />
        </svg>
      </span>
      <span className={styles.word}>
        Uni<span className={styles.wordAccent}>Trade</span>
      </span>
    </Link>
  );
}
