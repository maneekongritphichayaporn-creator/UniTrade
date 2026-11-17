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

const numberFormat = new Intl.NumberFormat('th-TH');
const formatCount = (value) => numberFormat.format(value ?? 0);

function formatTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

/** แถบแบ่งสัดส่วน + คำอธิบายสี ตัวเลขจริงอยู่ใน legend แถบจึงซ่อนจาก screen reader */
function Breakdown({ parts, total }) {
  return (
    <>
      <div className={styles.segments} aria-hidden="true">
        {total > 0 &&
          parts
            .filter((part) => part.value > 0)
            .map((part) => (
              <span key={part.key} className={part.className} style={{ flexGrow: part.value }} />
            ))}
      </div>
      <ul className={styles.legend}>
        {parts.map((part) => (
          <li key={part.key}>
            <span className={`${styles.dot} ${part.className}`} aria-hidden="true" />
            {part.label}
            <strong>{formatCount(part.value)}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}

/** รายการพร้อมเส้นบาง ๆ ยาวตามค่าที่มากที่สุดในรายการ */
function RankList({ items }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ol className={styles.rank}>
      {items.map((item) => (
        <li key={item.key}>
          <span className={styles.rankLabel}>{item.label}</span>
          <span className={styles.rankValue}>{formatCount(item.value)}</span>
          <span className={styles.rankLine} aria-hidden="true">
            <span style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function StatsSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <div className={`skeleton ${styles.skeletonBox}`} />
      <div className={`skeleton ${styles.skeletonBox}`} />
      <div className={`skeleton ${styles.skeletonBox} ${styles.tall}`} />
      <div className={`skeleton ${styles.skeletonBox} ${styles.tall}`} />
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

  return (
    <section className={styles.section} aria-labelledby="admin-stats-title" aria-busy={loading}>
      <header className={styles.header}>
        <h2 id="admin-stats-title">ภาพรวมของเว็บ</h2>
        <div className={styles.refresh}>
          {stats && <span>อัปเดตเมื่อ {formatTime(stats.generated_at)} น.</span>}
          <button type="button" disabled={loading} onClick={() => load()}>
            {loading ? 'กำลังโหลด…' : 'รีเฟรช'}
          </button>
        </div>
      </header>

      {error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : !stats ? (
        <StatsSkeleton />
      ) : (
        <StatsBody stats={stats} />
      )}
    </section>
  );
}

function StatsBody({ stats }) {
  const { products, reports, users } = stats;

  const reasons = REPORT_REASONS.map((reason) => ({
    key: reason,
    label: REPORT_REASON_LABELS[reason],
    value: reports.by_reason?.[reason] ?? 0,
  }));
  const reported = reasons.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const notReported = reasons.filter((item) => item.value === 0);

  const categories = stats.categories
    .map((category) => ({ key: category.category_id, label: categoryLabel(category), value: category.product_count }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={styles.grid}>
      <article className={styles.box}>
        <h3 className={styles.boxTitle}>ประกาศในระบบ</h3>
        <p className={styles.big}>
          {formatCount(products.total)} <small>ประกาศ</small>
        </p>
        <Breakdown
          total={products.total}
          parts={[
            { key: 'available', label: STATUS_LABELS.available, value: products.available, className: styles.cAvailable },
            { key: 'reserved', label: STATUS_LABELS.reserved, value: products.reserved, className: styles.cReserved },
            { key: 'sold', label: STATUS_LABELS.sold, value: products.sold, className: styles.cSold },
          ]}
        />
        <dl className={styles.facts}>
          <div>
            <dt>แจกฟรี</dt>
            <dd>{formatCount(products.free)}</dd>
          </div>
          <div>
            <dt>ยกเลิกการขาย (แอดมินลบ)</dt>
            <dd>{formatCount(products.removed_by_admin)}</dd>
          </div>
        </dl>
      </article>

      <article className={styles.box}>
        <h3 className={styles.boxTitle}>ผู้ใช้</h3>
        <p className={styles.big}>
          {formatCount(users.total)} <small>บัญชี</small>
        </p>
        <p className={styles.note}>
          {users.new_last_7_days > 0 ? (
            <>
              สมัครใหม่ <strong className={styles.up}>+{formatCount(users.new_last_7_days)}</strong> ใน 7 วันที่ผ่านมา
            </>
          ) : (
            'ยังไม่มีคนสมัครใหม่ใน 7 วันที่ผ่านมา'
          )}
        </p>
      </article>

      <article className={styles.box}>
        <h3 className={styles.boxTitle}>รายงาน</h3>
        <p className={styles.big}>
          {formatCount(reports.total)} <small>รายงาน</small>
        </p>
        <Breakdown
          total={reports.total}
          parts={[
            { key: 'pending', label: 'รอตรวจสอบ', value: reports.by_status?.pending, className: styles.cPending },
            { key: 'actioned', label: 'ลบประกาศแล้ว', value: reports.by_status?.actioned, className: styles.cActioned },
            { key: 'dismissed', label: 'ปิดเคส', value: reports.by_status?.dismissed, className: styles.cDismissed },
          ]}
        />
        <h4 className={styles.subTitle}>เหตุผลที่ถูกรายงาน</h4>
        {reported.length === 0 ? (
          <p className={styles.note}>ยังไม่มีใครรายงานประกาศ</p>
        ) : (
          <RankList items={reported} />
        )}
        {reported.length > 0 && notReported.length > 0 && (
          <p className={styles.muted}>ไม่มีรายงาน: {notReported.map((item) => item.label).join(', ')}</p>
        )}
      </article>

      <article className={styles.box}>
        <h3 className={styles.boxTitle}>ประกาศแยกตามหมวดหมู่</h3>
        {products.total === 0 ? <p className={styles.note}>ยังไม่มีประกาศ</p> : <RankList items={categories} />}
        <p className={styles.muted}>นับทุกสถานะ รวมที่ขายแล้ว</p>
      </article>
    </div>
  );
}
