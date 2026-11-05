'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOutIcon, PackageIcon, ShieldCheckIcon, UserIcon } from '@/components/ui/icons.js';
import { logout } from '@/lib/client/auth.js';
import { routes } from '@/lib/client/routes.js';
import styles from './ProfileMenu.module.css';

export function ProfileMenu({ user, isAdmin }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // ปิดเมนูเมื่อคลิกที่อื่นหรือกด Escape
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push(routes.home);
  }

  const initial = (user?.full_name ?? '?').trim().charAt(0);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
        <span className={styles.triggerLabel}>{isAdmin ? 'ผู้ดูแลระบบ' : 'บัญชีของฉัน'}</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.identity}>
            <p className={styles.name}>{user?.full_name}</p>
            <p className={styles.email}>{user?.email}</p>
          </div>
          <Link href={routes.profile} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            <UserIcon size={16} />
            โปรไฟล์ของฉัน
          </Link>
          <Link href={routes.myProducts} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            <PackageIcon size={16} />
            ประกาศของฉัน
          </Link>
          {isAdmin && (
            <Link href={routes.admin} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
              <ShieldCheckIcon size={16} />
              จัดการรายงาน
            </Link>
          )}
          <button type="button" className={styles.item} role="menuitem" onClick={handleLogout}>
            <LogOutIcon size={16} />
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
