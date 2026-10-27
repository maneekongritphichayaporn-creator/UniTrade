import { Suspense } from 'react';
import { LoginPlaceholder } from '@/components/auth/LoginPlaceholder.js';

export const metadata = {
  title: 'เข้าสู่ระบบ',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPlaceholder />
    </Suspense>
  );
}
