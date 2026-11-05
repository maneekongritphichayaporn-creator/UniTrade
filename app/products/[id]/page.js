import { ProductDetailView } from '@/components/products/ProductDetailView.js';

export const metadata = {
  title: 'รายละเอียดสินค้า',
};

// Next.js 15: params เป็น Promise
export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return <ProductDetailView productId={id} />;
}
