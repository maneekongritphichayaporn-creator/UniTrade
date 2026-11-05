'use client';

// ช่องค้นหา (TASK-16)
// - อยู่หน้าแรก: พิมพ์แล้วรอ 400ms ค่อยยิง API (debounce) และเขียนคำค้นลง URL แบบไม่เพิ่มประวัติ
// - อยู่หน้าอื่น: กด Enter หรือปุ่มค้นหาแล้วพาไปหน้าแรกพร้อมคำค้น
// - มีปุ่มล้างคำค้นหาเมื่อมีข้อความอยู่

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CloseIcon, SearchIcon } from '@/components/ui/icons.js';
import { routes } from '@/lib/client/routes.js';
import styles from './SearchBar.module.css';

const DEBOUNCE_MS = 400;

export function SearchBar({ autoFocus = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);

  const urlKeyword = searchParams.get('keyword') ?? '';
  const [value, setValue] = useState(urlKeyword);
  const onHome = pathname === routes.home;

  // ให้ช่องค้นหาตรงกับ URL เสมอ (กดย้อนกลับ หรือกดล้างตัวกรองจากที่อื่น)
  useEffect(() => {
    setValue(urlKeyword);
  }, [urlKeyword]);

  // พิมพ์อยู่หน้าแรก = กรองสด ๆ แบบหน่วงเวลา ลดจำนวนคำขอที่ยิงไปเซิร์ฟเวอร์
  useEffect(() => {
    if (!onHome || value === urlKeyword) return undefined;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim()) next.set('keyword', value.trim());
      else next.delete('keyword');
      next.delete('page');
      const queryString = next.toString();
      router.replace(queryString ? `${routes.home}?${queryString}` : routes.home, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, urlKeyword, onHome, router, searchParams]);

  function handleSubmit(event) {
    event.preventDefault();
    const keyword = value.trim();
    if (onHome) return; // หน้าแรกอัปเดตจาก debounce อยู่แล้ว
    router.push(keyword ? `${routes.home}?keyword=${encodeURIComponent(keyword)}` : routes.home);
  }

  function handleClear() {
    setValue('');
    inputRef.current?.focus();
    if (!onHome) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('keyword');
    next.delete('page');
    const queryString = next.toString();
    router.replace(queryString ? `${routes.home}?${queryString}` : routes.home, { scroll: false });
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <button type="submit" className={styles.submit} aria-label="ค้นหา">
        <SearchIcon size={18} />
      </button>
      <input
        ref={inputRef}
        type="search"
        name="keyword"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ค้นหาชื่อสินค้า เช่น แคลคูลัส, เสื้อกาวน์"
        aria-label="ค้นหาสินค้า"
        maxLength={100}
        className={styles.input}
      />
      {value && (
        <button type="button" className={styles.clear} onClick={handleClear} aria-label="ล้างคำค้นหา">
          <CloseIcon size={16} />
        </button>
      )}
    </form>
  );
}
