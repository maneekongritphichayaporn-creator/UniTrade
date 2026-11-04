import { ProductDetail } from '@/components/products/ProductDetail.js';

export const metadata = { title: 'รายละเอียดสินค้า' };

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
