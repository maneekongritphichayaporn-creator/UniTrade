'use client';

// สถิติภาพรวมของเว็บในหน้า /admin — GET /admin/stats
// แยกจาก AdminDashboard.js (TASK-20 ของ @warixm) แสดงต่อจากตารางรายงานใน app/admin/page.js
// การพาคนที่ไม่ใช่ admin ออกจากหน้านี้เป็นงานของ AdminDashboard ส่วนนี้แค่ไม่แสดงอะไร

import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { getAdminStats } from '@/lib/client/admin-stats.js';
import { REPORT_REASONS, REPORT_REASON_LABELS, STATUS_LABELS, categoryLabel } from '@/lib/client/format.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './AdminStats.module.css';

// คำเดียวกับปุ่มในตารางรายงาน: ปิดเคส = dismissed, ลบประกาศ = actioned
const REPORT_STATUSES = [
  { key: 'pending', label: 'รอตรวจสอบ', className: styles.chipPending },
  { key: 'actioned', label: 'ลบประกาศแล้ว', className: styles.chipActioned },
  { key: 'dismissed', label: 'ปิดเคส', className: styles.chipDismissed },
];

const numberFormat = new Intl.NumberFormat('th-TH');
const formatCount = (value) => numberFormat.format(value ?? 0);

function formatUpdatedAt(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// มากไปน้อย ถ้าเท่ากันคงลำดับเดิม
const byCountDesc = (items) => [...items].sort((a, b) => b.value - a.value);

function StatCard({ label, value, hint, tone }) {
  return (
    <div className={`${styles.card} ${tone ?? ''}`}>
      <span className={styles.cardLabel}>{label}</span>
      <strong className={styles.cardValue}>{formatCount(value)}</strong>
      {hint && <span className={styles.cardHint}>{hint}</span>}
    </div>
  );
}

/** แท่งยาวตามสัดส่วนของ total ตัวเลขจริงอยู่ในข้อความ แท่งจึงซ่อนจาก screen reader */
function BarList({ items, total }) {
  return (
    <ul className={styles.bars}>
      {items.map((item) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.key}>
            <div className={styles.barText}>
              <span>{item.label}</span>
              <span className={styles.barCount}>
                {formatCount(item.value)} <small>({percent}%)</small>
              </span>
            </div>
            <div className={styles.barTrack} aria-hidden="true">
              <div className={styles.barFill} style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StatsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className={styles.cards}>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`skeleton ${styles.skeletonCard}`} />
        ))}
      </div>
      <div className={styles.panels}>
        <div className={`skeleton ${styles.skeletonPanel}`} />
        <div className={`skeleton ${styles.skeletonPanel}`} />
      </div>
    </div>
  );
}

export function AdminStats() {
  const { status: authStatus, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getAdminStats({ signal }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.status === 403) setForbidden(true);
      else setError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !isAdmin) return undefined;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [authStatus, isAdmin, load]);

  if (authStatus !== 'authenticated' || !isAdmin || forbidden) return null;

  const products = stats?.products;
  const reports = stats?.reports;
  const reasonItems = reports
    ? byCountDesc(
        REPORT_REASONS.map((reason) => ({
          key: reason,
          label: REPORT_REASON_LABELS[reason],
          value: reports.by_reason?.[reason] ?? 0,
        })),
      )
    : [];
  const categoryItems = stats
    ? byCountDesc(
        stats.categories.map((category) => ({
          key: category.category_id,
          label: categoryLabel(category),
          value: category.product_count,
        })),
      )
    : [];

  return (
    <section className={styles.section} aria-labelledby="admin-stats-title" aria-busy={loading}>
      <div className={styles.header}>
        <div>
          <h2 id="admin-stats-title">ภาพรวมของเว็บ</h2>
          <p>{stats ? `ข้อมูล ณ ${formatUpdatedAt(stats.generated_at)}` : 'สถิติสินค้า รายงาน และผู้ใช้'}</p>
        </div>
        <button type="button" className="btn btn--outline btn--sm" disabled={loading} onClick={() => load()}>
          {loading ? 'กำลังโหลด…' : 'รีเฟรช'}
        </button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : !stats ? (
        <StatsSkeleton />
      ) : (
        <>
          <div className={styles.cards}>
            <StatCard label="สินค้าทั้งหมด" value={products.total} hint="ประกาศที่ยังอยู่ในระบบ" tone={styles.toneBrand} />
            <StatCard label={STATUS_LABELS.available} value={products.available} tone={styles.toneAvailable} />
            <StatCard label={STATUS_LABELS.reserved} value={products.reserved} tone={styles.toneReserved} />
            <StatCard label={STATUS_LABELS.sold} value={products.sold} tone={styles.toneSold} />
            <StatCard
              label="ยกเลิกการขาย"
              value={products.removed_by_admin}
              hint="ประกาศที่แอดมินลบ"
              tone={styles.toneRemoved}
            />
            <StatCard label="ของแจกฟรี" value={products.free} hint="ราคา 0 บาท ทุกสถานะ" />
            <StatCard label="ผู้ใช้ทั้งหมด" value={stats.users.total} tone={styles.toneUsers} />
            <StatCard label="สมัครใหม่ 7 วัน" value={stats.users.new_last_7_days} tone={styles.toneUsers} />
          </div>

          <div className={styles.panels}>
            <section className={styles.panel} aria-labelledby="admin-stats-reports">
              <div className={styles.panelHead}>
                <h3 id="admin-stats-reports">รายงานแยกตามเหตุผล</h3>
                <span>ทั้งหมด {formatCount(reports.total)} รายงาน</span>
              </div>
              <div className={styles.chips}>
                {REPORT_STATUSES.map(({ key, label, className }) => (
                  <span key={key} className={`${styles.chip} ${className}`}>
                    {label} {formatCount(reports.by_status?.[key])}
                  </span>
                ))}
              </div>
              {reports.total === 0 ? (
                <p className={styles.emptyNote}>ยังไม่มีรายงาน</p>
              ) : (
                <BarList items={reasonItems} total={reports.total} />
              )}
            </section>

            <section className={styles.panel} aria-labelledby="admin-stats-categories">
              <div className={styles.panelHead}>
                <h3 id="admin-stats-categories">สินค้าแยกตามหมวดหมู่</h3>
                <span>นับทุกสถานะ</span>
              </div>
              {products.total === 0 ? (
                <p className={styles.emptyNote}>ยังไม่มีสินค้า</p>
              ) : (
                <BarList items={categoryItems} total={products.total} />
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
