'use client';

// หน้าแรก / แคตตาล็อกสินค้า (TASK-10 + TASK-16)
// ตัวกรองทั้งหมดอ่านจาก URL ไม่เก็บ state ซ้ำ — เปลี่ยน URL แล้วหน้านี้ยิง GET /products ใหม่เอง
// ผลที่ได้คือกดย้อนกลับได้ รีเฟรชแล้วตัวกรองไม่หาย และก็อปลิงก์ไปแชร์ได้ตามที่ต้องการใน TASK-16

import { useCallback, useEffect, useState } from 'react';
import { FilterIcon, CloseIcon } from '@/components/ui/icons.js';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { getCategories, getPickupLocations } from '@/lib/client/catalog.js';
import { listProducts } from '@/lib/client/products.js';
import { DEFAULT_PER_PAGE, toApiQuery, useProductQuery } from '@/lib/client/useProductQuery.js';
import { CategoryBar } from './CategoryBar.js';
import { EmptyState } from './EmptyState.js';
import { FilterPanel } from './FilterPanel.js';
import { Pagination } from './Pagination.js';
import { ProductGrid, ProductGridSkeleton } from './ProductGrid.js';
import { SortSelect } from './SortSelect.js';
import styles from './HomeView.module.css';

export function HomeView() {
  const { filters, setFilters, resetFilters, activeFilterCount } = useProductQuery();

  const [catalog, setCatalog] = useState({ categories: [], pickupLocations: [], loading: true });
  const [result, setResult] = useState({ status: 'loading', data: [], pagination: null, message: '', error: null });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // หมวดหมู่กับจุดนัดรับเปลี่ยนน้อยมาก โหลดครั้งเดียวตอนเปิดหน้า
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getCategories({ signal: controller.signal }),
      getPickupLocations({ signal: controller.signal }),
    ])
      .then(([categoryResponse, locationResponse]) => {
        setCatalog({
          categories: categoryResponse?.data ?? [],
          pickupLocations: locationResponse?.data ?? [],
          loading: false,
        });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        // ตัวกรองโหลดไม่ได้ก็ยังดูรายการสินค้าได้ แค่ไม่มีตัวเลือกให้กด
        setCatalog((current) => ({ ...current, loading: false }));
      });
    return () => controller.abort();
  }, []);

  const queryKey = JSON.stringify(toApiQuery(filters, DEFAULT_PER_PAGE));

  useEffect(() => {
    const controller = new AbortController();
    setResult((current) => ({ ...current, status: 'loading' }));

    listProducts(JSON.parse(queryKey), { signal: controller.signal })
      .then((response) => {
        setResult({
          status: 'ready',
          data: response?.data ?? [],
          pagination: response?.pagination ?? null,
          message: response?.message ?? '',
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setResult({ status: 'error', data: [], pagination: null, message: '', error });
      });

    return () => controller.abort();
  }, [queryKey, reloadToken]);

  const selectedCategoryIds = filters.category_id ? filters.category_id.split(',') : [];

  const toggleCategory = useCallback(
    (categoryId) => {
      const next = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId];
      setFilters({ category_id: next.join(',') });
    },
    [selectedCategoryIds, setFilters],
  );

  function changePage(page) {
    setFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const total = result.pagination?.total ?? 0;
  const totalPages = result.pagination?.total_pages ?? 0;
  const hasFilters = activeFilterCount > 0;

  return (
    <div className="container">
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>ส่งต่อของดีในรั้วจุฬาฯ</h1>
        <p className={styles.heroText}>
          ซื้อขายและแจกต่อของมือสองกับนิสิตและบุคลากรจุฬาฯ นัดรับในมหาวิทยาลัย ไม่มีค่าธรรมเนียม
        </p>
      </section>

      <CategoryBar
        categories={catalog.categories}
        selectedIds={selectedCategoryIds}
        onToggle={toggleCategory}
        onClear={() => setFilters({ category_id: '' })}
        loading={catalog.loading}
      />

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="ตัวกรองสินค้า">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            categories={catalog.categories}
            pickupLocations={catalog.pickupLocations}
          />
        </aside>

        <section className={styles.results}>
          <header className={styles.resultsHead}>
            <div className={styles.count}>
              {result.status === 'loading' && <span className="muted">กำลังค้นหา…</span>}
              {result.status === 'ready' && (
                <span>
                  พบ <strong>{total.toLocaleString('th-TH')}</strong> รายการ
                  {filters.keyword && (
                    <>
                      {' '}
                      สำหรับ “<strong>{filters.keyword}</strong>”
                    </>
                  )}
                </span>
              )}
            </div>

            <div className={styles.tools}>
              <button
                type="button"
                className={`btn btn--outline ${styles.filterToggle}`}
                onClick={() => setFiltersOpen(true)}
              >
                <FilterIcon size={16} />
                ตัวกรอง
                {hasFilters && <span className={styles.filterCount}>{activeFilterCount}</span>}
              </button>
              <SortSelect value={filters.sort} onChange={(sort) => setFilters({ sort })} />
            </div>
          </header>

          {result.status === 'error' && (
            <ErrorState error={result.error} onRetry={() => setReloadToken((value) => value + 1)} />
          )}

          {result.status === 'loading' && <ProductGridSkeleton count={DEFAULT_PER_PAGE} />}

          {result.status === 'ready' &&
            (result.data.length > 0 ? (
              <ProductGrid products={result.data} />
            ) : (
              <EmptyState message={result.message} hasFilters={hasFilters} onReset={resetFilters} />
            ))}

          {result.status === 'ready' && (
            <Pagination page={filters.page} totalPages={totalPages} onChange={changePage} />
          )}
        </section>
      </div>

      {/* มือถือ: แผงตัวกรองเปิดทับหน้าจอ */}
      {filtersOpen && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="ตัวกรองสินค้า">
          <button
            type="button"
            className={styles.drawerBackdrop}
            onClick={() => setFiltersOpen(false)}
            aria-label="ปิดตัวกรอง"
          />
          <div className={styles.drawerPanel}>
            <div className={styles.drawerHead}>
              <h2 className={styles.drawerTitle}>ตัวกรอง</h2>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="ปิด"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                activeFilterCount={activeFilterCount}
                categories={catalog.categories}
                pickupLocations={catalog.pickupLocations}
                showHeading={false}
              />
            </div>
            <div className={styles.drawerFoot}>
              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={() => setFiltersOpen(false)}
              >
                ดูผล {total.toLocaleString('th-TH')} รายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
