'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal.js';
import { ImageIcon } from '@/components/ui/icons.js';
import { deleteAdminProduct, dismissAdminReport, listAdminReports } from '@/lib/client/admin.js';
import { formatPrice } from '@/lib/client/format.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './AdminDashboard.module.css';

const REASONS = {
  scam: 'หลอกลวง',
  spam: 'สแปม',
  prohibited_item: 'สินค้าต้องห้าม',
  wrong_category: 'หมวดหมู่ไม่ถูกต้อง',
  offensive_content: 'เนื้อหาไม่เหมาะสม',
  already_sold: 'สินค้าขายแล้ว',
  other: 'อื่น ๆ',
};

function displayDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
  }).format(date);
}

export function AdminDashboard() {
  const router = useRouter();
  const { status: authStatus, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pending, setPending] = useState(false);

  const loadReports = useCallback(async (nextPage, signal) => {
    const result = await listAdminReports({ page: nextPage, signal });
    setReports(Array.isArray(result?.data) ? result.data : []);
    setPagination(result.pagination);
    return result;
  }, []);

  useEffect(() => {
    if (authStatus === 'guest') router.replace(routes.login(routes.admin));
    if (authStatus === 'authenticated' && !isAdmin) router.replace(routes.home);
  }, [authStatus, isAdmin, router]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !isAdmin) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    loadReports(page, controller.signal)
      .then((result) => {
        if (page > 1 && result.pagination.total_pages < page) {
          setPage(Math.max(1, result.pagination.total_pages));
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 403) router.replace(routes.home);
        else setError(err.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [authStatus, isAdmin, loadReports, page, router]);

  async function refreshReports() {
    const result = await loadReports(page);
    if (!result.data.length && page > 1) setPage(Math.max(1, result.pagination.total_pages));
  }

  async function handleActionError(err, fallback) {
    if (err.status === 403) { router.replace(routes.home); return; }
    setSelected(null);
    setConfirmDelete(null);
    if (err.code === 'REPORT_ALREADY_RESOLVED' || err.code === 'PRODUCT_NOT_FOUND') {
      try {
        await refreshReports();
        setMessage('รายการนี้ได้รับการจัดการไปแล้ว โหลดข้อมูลล่าสุดให้แล้ว');
      } catch (reloadError) {
        setError(reloadError.message || 'โหลดรายงานล่าสุดไม่สำเร็จ กรุณาลองใหม่');
      }
      return;
    }
    setError(err.message || fallback);
  }

  async function dismiss(report) {
    if (pending) return;
    setPending(true);
    setError('');
    setMessage('');
    try {
      await dismissAdminReport(report.report_id);
      setSelected(null);
      setMessage('ปิดเคสรายงานแล้ว');
      try { await refreshReports(); }
      catch (reloadError) { setError(reloadError.message || 'โหลดรายงานล่าสุดไม่สำเร็จ'); }
    } catch (err) {
      await handleActionError(err, 'ปิดเคสไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setPending(false);
    }
  }

  async function removeProduct() {
    if (!confirmDelete?.product?.product_id || pending) return;
    setPending(true);
    setError('');
    setMessage('');
    try {
      await deleteAdminProduct(confirmDelete.product.product_id);
      setSelected(null);
      setConfirmDelete(null);
      setMessage('ลบประกาศและจัดการรายงานแล้ว');
      try { await refreshReports(); }
      catch (reloadError) { setError(reloadError.message || 'โหลดรายงานล่าสุดไม่สำเร็จ'); }
    } catch (err) {
      await handleActionError(err, 'ลบประกาศไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setPending(false);
    }
  }

  if (authStatus === 'loading' || authStatus === 'guest') {
    return <p className={styles.notice}>กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ…</p>;
  }
  if (!isAdmin) return <p className={styles.notice}>ส่วนนี้สำหรับผู้ดูแลระบบเท่านั้น</p>;

  return <div className={styles.page}>
    <Link href={routes.home} className={styles.back}>← กลับหน้าแรก</Link>
    <div className={styles.heading}>
      <div><h1>Admin Dashboard</h1><p>ตรวจสอบและจัดการประกาศที่ถูกรายงาน</p></div>
      <span className={styles.total}>รอตรวจสอบ {pagination.total} รายงาน</span>
    </div>

    {error && <p className={styles.error} role="alert">{error}</p>}
    {message && <p className={styles.message} role="status">{message}</p>}

    {loading ? <p className={styles.notice}>กำลังโหลดรายงาน…</p> : error && reports.length === 0 ?
      <div className={styles.empty}><p>โหลดรายงานไม่สำเร็จ</p><button type="button" className="btn btn--outline" onClick={() => {
        setLoading(true);
        setError('');
        loadReports(page).catch((err) => setError(err.message)).finally(() => setLoading(false));
      }}>ลองใหม่</button></div> : reports.length === 0 ?
      <div className={styles.empty}><h2>ไม่มีประกาศที่รอตรวจสอบ</h2><p>รายงานทั้งหมดได้รับการจัดการแล้ว</p></div> :
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>ประกาศสินค้า</th><th>เหตุผล</th><th>ผู้รายงาน</th><th>วันที่รายงาน</th><th>จัดการ</th></tr></thead>
          <tbody>{reports.map((report) => <tr key={report.report_id}>
            <td data-label="ประกาศสินค้า"><div className={styles.product}>
              <span className={styles.image}>{report.product?.primary_image_url ?
                <img src={report.product.primary_image_url} alt="" /> : <ImageIcon size={24} />}</span>
              <span className={styles.productText}>{report.product ?
                <Link href={routes.product(report.product.product_id)}>{report.product.title}</Link> :
                <span>ประกาศถูกลบแล้ว</span>}
                {report.product && <small>{formatPrice(report.product.price, Number(report.product.price) === 0)}</small>}
              </span>
            </div></td>
            <td data-label="เหตุผล">{REASONS[report.reason] || report.reason}</td>
            <td data-label="ผู้รายงาน">{report.reporter?.full_name || '—'}</td>
            <td data-label="วันที่รายงาน">{displayDate(report.created_at)}</td>
            <td data-label="จัดการ"><div className={styles.actions}>
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setSelected(report)}>ดูรายละเอียด</button>
              <button type="button" className="btn btn--outline btn--sm" disabled={pending} onClick={() => dismiss(report)}>ปิดเคส</button>
              <button type="button" className={styles.danger} disabled={pending || !report.product} onClick={() => setConfirmDelete(report)}>ลบประกาศ</button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>}

    {!loading && pagination.total_pages > 1 && <nav className={styles.pagination} aria-label="หน้ารายงาน">
      <button type="button" className="btn btn--outline btn--sm" disabled={page <= 1 || pending}
        onClick={() => setPage((current) => current - 1)}>ก่อนหน้า</button>
      <span>หน้า {page} จาก {pagination.total_pages}</span>
      <button type="button" className="btn btn--outline btn--sm" disabled={page >= pagination.total_pages || pending}
        onClick={() => setPage((current) => current + 1)}>ถัดไป</button>
    </nav>}

    {selected && <Modal title="รายละเอียดรายงาน" onClose={() => { if (!pending) setSelected(null); }}
      footer={<div className={styles.modalActions}>
        <button type="button" className="btn btn--outline" disabled={pending} onClick={() => dismiss(selected)}>ปิดเคส</button>
        <button type="button" className={styles.danger} disabled={pending || !selected.product} onClick={() => { setConfirmDelete(selected); setSelected(null); }}>ลบประกาศ</button>
      </div>}>
      <h3 className={styles.modalTitle}>{selected.product?.title || 'ประกาศถูกลบแล้ว'}</h3>
      <dl className={styles.details}>
        <div><dt>เหตุผล</dt><dd>{REASONS[selected.reason] || selected.reason}</dd></div>
        <div><dt>วันที่รายงาน</dt><dd>{displayDate(selected.created_at)}</dd></div>
        <div><dt>ผู้รายงาน</dt><dd>{selected.reporter?.full_name || '—'}</dd></div>
        <div><dt>ผู้ขาย</dt><dd>{selected.product?.seller?.full_name || '—'}</dd></div>
      </dl>
      {selected.product && <Link className={styles.productLink} href={routes.product(selected.product.product_id)}>ดูหน้าประกาศสินค้า →</Link>}
    </Modal>}

    {confirmDelete && <Modal title="ยืนยันการลบประกาศ" onClose={() => { if (!pending) setConfirmDelete(null); }}
      footer={<div className={styles.modalActions}>
        <button type="button" className="btn btn--outline" disabled={pending} onClick={() => setConfirmDelete(null)}>ยกเลิก</button>
        <button type="button" className={styles.danger} disabled={pending} onClick={removeProduct}>{pending ? 'กำลังลบ…' : 'ยืนยันลบประกาศ'}</button>
      </div>}>
      <p>ลบประกาศ “{confirmDelete.product?.title}” และจัดการรายงานของประกาศนี้?</p>
    </Modal>}
  </div>;
}
