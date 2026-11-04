'use client';

// กล่องป็อปอัปใช้ซ้ำได้ — ปิดด้วย Escape หรือคลิกพื้นหลัง และล็อกการเลื่อนหน้าไว้ระหว่างเปิด

import { useEffect, useRef } from 'react';
import { CloseIcon } from './icons.js';
import styles from './Modal.module.css';

export function Modal({ title, onClose, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="ปิด" />
      <div className={styles.panel} ref={panelRef} tabIndex={-1}>
        <header className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="ปิด">
            <CloseIcon size={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.foot}>{footer}</footer>}
      </div>
    </div>
  );
}
