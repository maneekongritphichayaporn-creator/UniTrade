import { Suspense } from 'react';
import { MarketplaceHome } from '@/components/home/MarketplaceHome.js';

export default function Home() {
  return <Suspense fallback={null}><MarketplaceHome /></Suspense>;
}
