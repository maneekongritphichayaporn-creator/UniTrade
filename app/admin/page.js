import { AdminDashboard } from '@/components/admin/AdminDashboard.js';
import { AdminStats } from '@/components/admin/AdminStats.js';

export const metadata = { title: 'จัดการรายงาน' };

export default function AdminPage() {
  return (
    <>
      <AdminDashboard />
      <AdminStats />
    </>
  );
}
