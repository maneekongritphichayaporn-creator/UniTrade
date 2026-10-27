'use client';

// แผงตัวกรอง (TASK-16) — เดสก์ท็อปเป็น sidebar ติดด้านซ้าย มือถือเปิดเป็น drawer จากปุ่ม "ตัวกรอง"
// ทุกตัวเลือกเขียนค่าลง URL ผ่าน setFilters ของ useProductQuery ไม่เก็บ state ซ้ำ
// ยกเว้นช่องราคาที่เก็บ state ในเครื่องไว้ก่อน แล้วหน่วง 500ms ค่อยเขียน URL (ไม่ยิง API ทุกตัวอักษร)

import { useEffect, useState } from 'react';
import { categoryLabel, ITEM_CONDITIONS, ITEM_CONDITION_LABELS } from '@/lib/client/format.js';
import styles from './FilterPanel.module.css';

const PRICE_DEBOUNCE_MS = 500;

/** ยอมรับเฉพาะตัวเลข 0 ขึ้นไป (API ตอบ 422 ถ้าส่งค่าอื่น) */
function sanitizePrice(raw) {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
}

export function FilterPanel({
  filters,
  setFilters,
  resetFilters,
  activeFilterCount,
  categories,
  pickupLocations,
  // ใน drawer บนมือถือมีหัวข้อ "ตัวกรอง" อยู่แล้ว ไม่ต้องขึ้นซ้ำ
  showHeading = true,
}) {
  const [minPrice, setMinPrice] = useState(filters.min_price);
  const [maxPrice, setMaxPrice] = useState(filters.max_price);

  // ค่าใน URL เปลี่ยนจากที่อื่น (กดล้างตัวกรอง/กดย้อนกลับ) ให้ช่องราคาตามไปด้วย
  useEffect(() => {
    setMinPrice(filters.min_price);
    setMaxPrice(filters.max_price);
  }, [filters.min_price, filters.max_price]);

  useEffect(() => {
    if (minPrice === filters.min_price && maxPrice === filters.max_price) return undefined;
    const timer = setTimeout(() => {
      setFilters({ min_price: minPrice, max_price: maxPrice });
    }, PRICE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice, filters.min_price, filters.max_price, setFilters]);

  const selectedCategories = filters.category_id ? filters.category_id.split(',') : [];
  const priceInvalid =
    minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice);

  function toggleCategory(categoryId) {
    const next = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setFilters({ category_id: next.join(',') });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        {showHeading && <h2 className={styles.heading}>ตัวกรอง</h2>}
        {activeFilterCount > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={resetFilters}>
            ล้างทั้งหมด ({activeFilterCount})
          </button>
        )}
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>หมวดหมู่</legend>
        <div className={styles.options}>
          {categories.length === 0 && <p className={styles.loading}>กำลังโหลด…</p>}
          {categories.map((category) => (
            <label key={category.category_id} className="checkbox">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.category_id)}
                onChange={() => toggleCategory(category.category_id)}
              />
              <span>{categoryLabel(category)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>ราคา (บาท)</legend>
        <div className={styles.priceRow}>
          <input
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="ต่ำสุด"
            aria-label="ราคาต่ำสุด"
            value={minPrice}
            disabled={filters.free_only}
            onChange={(event) => setMinPrice(sanitizePrice(event.target.value))}
          />
          <span className={styles.dash} aria-hidden="true">
            –
          </span>
          <input
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="สูงสุด"
            aria-label="ราคาสูงสุด"
            value={maxPrice}
            disabled={filters.free_only}
            onChange={(event) => setMaxPrice(sanitizePrice(event.target.value))}
          />
        </div>
        {priceInvalid && (
          <p className={styles.error} role="alert">
            ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด
          </p>
        )}
        <label className="checkbox" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={filters.free_only}
            onChange={(event) =>
              setFilters(
                event.target.checked
                  ? { free_only: true, min_price: '', max_price: '' }
                  : { free_only: false },
              )
            }
          />
          <span>เฉพาะของแจกฟรี (0 บาท)</span>
        </label>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>จุดนัดรับ</legend>
        <select
          className="select"
          value={filters.pickup_location}
          onChange={(event) => setFilters({ pickup_location: event.target.value })}
          aria-label="จุดนัดรับ"
        >
          <option value="">ทุกจุดนัดรับ</option>
          {pickupLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>สภาพสินค้า</legend>
        <div className={styles.options}>
          <label className="checkbox">
            <input
              type="radio"
              name="item_condition"
              checked={filters.item_condition === ''}
              onChange={() => setFilters({ item_condition: '' })}
            />
            <span>ทุกสภาพ</span>
          </label>
          {ITEM_CONDITIONS.map((condition) => (
            <label key={condition} className="checkbox">
              <input
                type="radio"
                name="item_condition"
                checked={filters.item_condition === condition}
                onChange={() => setFilters({ item_condition: condition })}
              />
              <span>{ITEM_CONDITION_LABELS[condition]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>สถานะ</legend>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.status === 'all'}
            onChange={(event) => setFilters({ status: event.target.checked ? 'all' : 'available' })}
          />
          <span>แสดงของที่ติดจอง/ขายแล้วด้วย</span>
        </label>
      </fieldset>
    </div>
  );
}
