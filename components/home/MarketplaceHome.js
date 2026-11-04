'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, UserIcon, ImageIcon } from '@/components/ui/icons.js';
import { getCategories } from '@/lib/client/catalog.js';
import { listProducts } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { WishlistButton } from '@/components/products/WishlistButton.js';
import styles from './MarketplaceHome.module.css';

const conditions = { new: 'ใหม่', like_new: 'เหมือนใหม่', good: 'สภาพดี', fair: 'พอใช้' };

export function MarketplaceHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const params = new URLSearchParams(queryString);
  const keyword = params.get('keyword') ?? '';
  const category = params.get('category_id') ?? '';
  const priceRange = params.get('price_range') ?? '';
  const condition = params.get('item_condition') ?? '';
  const sort = params.get('sort') ?? 'date_desc';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(keyword);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => setSearch(keyword), [keyword]);

  useEffect(() => {
    const controller = new AbortController();
    getCategories({ signal: controller.signal })
      .then((body) => setCategories(body.data))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const price = priceRange === 'under-300' ? { max_price: 299.99 }
      : priceRange === '300-500' ? { min_price: 300, max_price: 500 }
      : priceRange === 'over-500' ? { min_price: 500.01 } : {};
    setResult(null);
    setError('');
    listProducts({ keyword, category_id: category, item_condition: condition, sort, page,
      status: 'all', ...price }, { signal: controller.signal })
      .then(setResult)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [keyword, category, priceRange, condition, sort, page]);

  function setFilter(key, value) {
    const next = new URLSearchParams(queryString);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.replace(next.size ? `/?${next}` : '/', { scroll: false });
  }

  function submitSearch(event) {
    event.preventDefault();
    setFilter('keyword', search.trim());
  }

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div><h1>Campus <span>Marketplace</span></h1><p>Buy &amp; sell within Chula</p></div>
        <form className={styles.search} onSubmit={submitSearch} role="search">
          <SearchIcon size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..." aria-label="ค้นหาสินค้า" maxLength={100} />
          <button type="submit" aria-label="ค้นหา"><SearchIcon size={18} /></button>
        </form>
      </section>

      <section className={styles.catalog} aria-label="Marketplace products">
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <label><span className="sr-only">หมวดหมู่</span><select value={category} onChange={(e) => setFilter('category_id', e.target.value)}>
              <option value="">หมวดหมู่</option>
              {categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.name}</option>)}
            </select></label>
            <label><span className="sr-only">ช่วงราคา</span><select value={priceRange} onChange={(e) => setFilter('price_range', e.target.value)}>
              <option value="">ช่วงราคา</option><option value="under-300">ต่ำกว่า ฿300</option>
              <option value="300-500">฿300–฿500</option><option value="over-500">มากกว่า ฿500</option>
            </select></label>
            <label><span className="sr-only">สภาพสินค้า</span><select value={condition} onChange={(e) => setFilter('item_condition', e.target.value)}>
              <option value="">สภาพสินค้า</option>
              {Object.entries(conditions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
          </div>
          <label><span className="sr-only">เรียงสินค้า</span><select value={sort} onChange={(e) => setFilter('sort', e.target.value)}>
            <option value="date_desc">เรียงตาม : ล่าสุด</option><option value="price_asc">ราคา : ต่ำไปสูง</option>
            <option value="price_desc">ราคา : สูงไปต่ำ</option>
          </select></label>
        </div>

        {error ? <p className={styles.message} role="alert">{error}</p>
          : !result ? <p className={styles.message}>กำลังโหลดสินค้า…</p>
          : result.data.length ? <div className={styles.grid}>{result.data.map((product) => <ProductCard key={product.product_id} product={product} />)}</div>
          : <div className={styles.message}><h2>ไม่พบสินค้า</h2><p>ลองเปลี่ยนคำค้นหาหรือตัวกรองอีกครั้ง</p></div>}

        {result?.pagination?.total_pages > 1 && <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>ก่อนหน้า</button>
          <span>หน้า {page} / {result.pagination.total_pages}</span>
          <button disabled={page >= result.pagination.total_pages} onClick={() => setPage(page + 1)}>ถัดไป</button>
        </div>}
      </section>
    </div>
  );

  function setPage(value) {
    const next = new URLSearchParams(queryString);
    next.set('page', String(value));
    router.replace(`/?${next}`, { scroll: false });
  }
}

function ProductCard({ product }) {
  return <article className={styles.card}>
    <Link href={routes.product(product.product_id)} className={styles.cardLink}>
    <div className={styles.image}>{product.primary_image_url
      ? <img src={product.primary_image_url} alt={product.title} /> : <ImageIcon size={64} />}</div>
    <span className={`${styles.status} ${styles[product.status]}`}>
      {product.status === 'available' ? 'พร้อมขาย' : product.status === 'reserved' ? 'จองแล้ว' : 'ขายแล้ว'}
    </span>
    <h2>{product.title}</h2>
    <strong className={styles.price}>{product.is_free ? 'ฟรี' : `฿${product.price.toLocaleString()}`}</strong>
    <p>หมวดหมู่ : {product.category?.name ?? 'อื่น ๆ'}</p>
    <div className={styles.seller}><span><UserIcon size={14} /></span>{product.seller?.full_name}</div>
    </Link>
    <WishlistButton productId={product.product_id} initialSaved={product.is_wishlisted} compact className={styles.heart} />
  </article>;
}
