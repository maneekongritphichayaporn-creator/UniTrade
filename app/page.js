import { Suspense } from 'react';
import { HomeView } from '@/components/products/HomeView.js';
import { ProductGridSkeleton } from '@/components/products/ProductGrid.js';

export const metadata = {
  title: 'UniTrade — ตลาดมือสองของนิสิตจุฬาฯ',
  description:
    'ค้นหาของมือสองจากนิสิตและบุคลากรจุฬาฯ กรองตามหมวดหมู่ ราคา จุดนัดรับ และสภาพสินค้า',
};

// HomeView อ่านตัวกรองจาก URL ด้วย useSearchParams จึงต้องอยู่ใน Suspense
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ paddingTop: 32 }}>
          <ProductGridSkeleton count={12} />
        </div>
      }
    >
      <HomeView />
    </Suspense>
  );
}
