'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartIcon, MenuIcon, CloseIcon, PlusIcon, UserIcon } from '@/components/ui/icons.js';
import { useAuth } from '@/lib/client/useAuth.js';
import { routes } from '@/lib/client/routes.js';
import { Logo } from './Logo.js';
import { ProfileMenu } from './ProfileMenu.js';
import { SearchBar } from './SearchBar.js';
import styles from './Navbar.module.css';

export function Navbar() {
  const { status, user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // เปลี่ยนหน้าแล้วปิดเมนูมือถือ
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Logo />

        <div className={styles.search}>
          {/* SearchBar อ่าน ?keyword= จาก URL จึงต้องอยู่ใน Suspense */}
          <Suspense fallback={<div className={styles.searchFallback} />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className={styles.actions} aria-label="เมนูหลัก">
          <Link href={routes.createProduct} className="btn btn--primary">
            <PlusIcon size={16} />
            ลงขายสินค้า
          </Link>

          <Link href={routes.wishlist} className={styles.iconLink} aria-label="รายการโปรด">
            <HeartIcon size={20} />
          </Link>

          {status === 'loading' && <div className={styles.authSkeleton} aria-hidden="true" />}
          {status === 'guest' && (
            <Link href={routes.login(pathname)} className="btn btn--outline">
              <UserIcon size={16} />
              เข้าสู่ระบบ
            </Link>
          )}
          {status === 'authenticated' && <ProfileMenu user={user} isAdmin={isAdmin} />}
        </nav>

        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu} id="mobile-menu">
          <div className="container">
            <Link href={routes.createProduct} className="btn btn--primary btn--block">
              <PlusIcon size={16} />
              ลงขายสินค้า
            </Link>

            <ul className={styles.mobileLinks}>
              <li>
                <Link href={routes.wishlist}>รายการโปรด</Link>
              </li>
              {status === 'authenticated' ? (
                <>
                  <li>
                    <Link href={routes.myProducts}>ประกาศของฉัน</Link>
                  </li>
                  <li>
                    <Link href={routes.profile}>โปรไฟล์ของฉัน</Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href={routes.admin}>จัดการรายงาน</Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <Link href={routes.login(pathname)}>เข้าสู่ระบบด้วยอีเมลจุฬาฯ</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
