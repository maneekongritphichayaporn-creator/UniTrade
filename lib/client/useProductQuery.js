'use client';

// ตัวกรองสินค้าทั้งหมดเก็บไว้ใน URL (TASK-16 — URL Query Sync)
// ข้อดีคือก็อปลิงก์ผลการค้นหาไปแชร์ได้ กดย้อนกลับได้ และรีเฟรชแล้วตัวกรองไม่หาย
// ชื่อพารามิเตอร์ตรงกับ query ของ GET /products เป๊ะ ๆ จะส่งต่อให้ API ได้เลย

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const DEFAULT_PER_PAGE = 12;
export const DEFAULT_SORT = 'date_desc';

/** พารามิเตอร์ที่เป็น "ตัวกรอง" (ไม่รวม sort กับ page) ใช้นับจำนวนตัวกรองที่เปิดอยู่ */
const FILTER_KEYS = [
  'keyword',
  'category_id',
  'min_price',
  'max_price',
  'free_only',
  'pickup_location',
  'item_condition',
  'status',
];

// API ตอบเฉพาะสินค้าที่ยังขายอยู่ถ้าไม่ส่ง status มา เราใช้ค่านี้เป็นค่าเริ่มต้นเหมือนกัน
export const DEFAULT_STATUS = 'available';

function readFilters(searchParams) {
  const get = (key) => searchParams.get(key) || '';
  return {
    keyword: get('keyword'),
    category_id: get('category_id'),
    min_price: get('min_price'),
    max_price: get('max_price'),
    free_only: get('free_only') === 'true',
    pickup_location: get('pickup_location'),
    item_condition: get('item_condition'),
    status: get('status') || DEFAULT_STATUS,
    sort: get('sort') || DEFAULT_SORT,
    page: Math.max(1, Number(get('page')) || 1),
  };
}

/** แปลงตัวกรองเป็น query ของ GET /products (ตัดค่าว่างออก) */
export function toApiQuery(filters, perPage = DEFAULT_PER_PAGE) {
  const query = { page: filters.page, per_page: perPage, sort: filters.sort, status: filters.status };
  if (filters.keyword) query.keyword = filters.keyword;
  if (filters.category_id) query.category_id = filters.category_id;
  if (filters.min_price !== '') query.min_price = filters.min_price;
  if (filters.max_price !== '') query.max_price = filters.max_price;
  if (filters.free_only) query.free_only = 'true';
  if (filters.pickup_location) query.pickup_location = filters.pickup_location;
  if (filters.item_condition) query.item_condition = filters.item_condition;
  return query;
}

export function useProductQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  /**
   * แก้ตัวกรองแล้วเขียนกลับลง URL
   * @param {object} patch ค่าที่จะเปลี่ยน ('' หรือ false = เอาออกจาก URL)
   * @param {{ replace?: boolean }} options replace = ไม่เพิ่มประวัติการกดย้อนกลับ (ใช้กับช่องค้นหาที่พิมพ์สด ๆ)
   */
  const setFilters = useCallback(
    (patch, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value === false || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      // เปลี่ยนตัวกรองแล้วต้องกลับไปหน้า 1 ไม่งั้นอาจค้างที่หน้าที่ไม่มีข้อมูล
      if (!('page' in patch)) next.delete('page');
      // ค่าที่เท่ากับค่าเริ่มต้นไม่ต้องอยู่ใน URL ลิงก์ที่แชร์จะได้สั้นและอ่านรู้เรื่อง
      if (next.get('page') === '1') next.delete('page');
      if (next.get('sort') === DEFAULT_SORT) next.delete('sort');
      if (next.get('status') === DEFAULT_STATUS) next.delete('status');

      const queryString = next.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const activeFilterCount = useMemo(
    () => FILTER_KEYS.filter((key) => {
      const value = filters[key];
      if (key === 'status') return value !== DEFAULT_STATUS;
      return value !== '' && value !== false;
    }).length,
    [filters],
  );

  return { filters, setFilters, resetFilters, activeFilterCount };
}
