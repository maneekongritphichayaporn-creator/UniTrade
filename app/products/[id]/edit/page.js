import { ListingForm } from '@/components/products/ListingForm.js';

export const metadata = { title: 'แก้ไขประกาศ' };
export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <ListingForm mode="edit" productId={id} />;
}
