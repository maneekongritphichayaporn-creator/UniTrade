'use client';

// ปุ่มรายงานประกาศ (FR-08 ฝั่งผู้ใช้ · API ของ TASK-19: POST /products/:id/reports)
// เจ้าของประกาศ: ไม่แสดงปุ่ม (API ตอบ 422 SELF_REPORT อยู่แล้ว ไม่ต้องให้กดไปเจอ error)
// ยังไม่ล็อกอิน: พาไปหน้าเข้าสู่ระบบ แล้วกลับมาหน้าเดิมผ่าน ?next=
// ล็อกอินแล้ว: เปิด modal ให้เลือกเหตุผล 1 ข้อจาก 7 ข้อ แล้วส่ง
// รายงานได้ทุกสถานะสินค้า รวมถึง Sold เพราะ API รับทุกสถานะ และของที่ขายแล้วก็ยังอาจเป็นการหลอกลวงได้

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlagIcon, ShieldCheckIcon } from '@/components/ui/icons.js';
import { Modal } from '@/components/ui/Modal.js';
import { REPORT_REASONS, REPORT_REASON_HINTS, REPORT_REASON_LABELS } from '@/lib/client/format.js';
import { reportProduct } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './ReportProductButton.module.css';

export function ReportProductButton({ productId, isOwner = false }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');

  // Modal ผูก effect ไว้กับ onClose ถ้าส่งฟังก์ชันใหม่ทุกครั้งที่ render โฟกัสจะเด้งกลับไปที่กล่อง
  const close = useCallback(() => setOpen(false), []);
  const markReported = useCallback((message) => setDoneMessage(message), []);

  if (isOwner || status === 'loading') return null;

  if (status === 'guest') {
    return (
      <div className={styles.wrap}>
        <Link href={routes.login(pathname)} className={`btn btn--ghost btn--sm ${styles.trigger}`}>
          <FlagIcon size={15} />
          รายงานประกาศนี้
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`btn btn--ghost btn--sm ${styles.trigger}`}
        onClick={() => setOpen(true)}
        disabled={Boolean(doneMessage)}
      >
        <FlagIcon size={15} />
        {doneMessage ? 'รายงานแล้ว' : 'รายงานประกาศนี้'}
      </button>
      {doneMessage && !open && <p className={styles.notice}>{doneMessage}</p>}

      {open && <ReportModal productId={productId} onClose={close} onReported={markReported} />}
    </div>
  );
}

function ReportModal({ productId, onClose, onReported }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  async function submit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const body = await reportProduct(productId, reason);
      const message = body?.message || 'ส่งรายงานเรียบร้อยแล้ว ผู้ดูแลระบบจะตรวจสอบโดยเร็ว';
      setResult(message);
      onReported(message);
    } catch (requestError) {
      if (requestError?.code === 'DUPLICATE_REPORT') {
        // เคยรายงานไปแล้ว ถือว่าจบเหมือนส่งสำเร็จ
        const message = requestError.message || 'คุณรายงานประกาศนี้ไปแล้ว ผู้ดูแลระบบกำลังตรวจสอบ';
        setResult(message);
        onReported(message);
      } else if (requestError?.status === 401) {
        setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง');
      } else {
        setError(requestError?.message || 'ส่งรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Modal
        title="รายงานประกาศ"
        onClose={onClose}
        footer={
          <div className={styles.actions}>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              ปิด
            </button>
          </div>
        }
      >
        <div className={styles.done}>
          <ShieldCheckIcon size={40} className={styles.doneIcon} />
          <p className={styles.doneText}>{result}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="รายงานประกาศ"
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            ยกเลิก
          </button>
          <button type="button" className="btn btn--primary" onClick={submit} disabled={!reason || submitting}>
            {submitting ? 'กำลังส่ง…' : 'ส่งรายงาน'}
          </button>
        </div>
      }
    >
      <p className={styles.intro}>
        เลือกเหตุผลที่ประกาศนี้ไม่เหมาะสม ผู้ดูแลระบบจะตรวจสอบ และผู้ขายจะไม่เห็นว่าใครเป็นคนรายงาน
      </p>

      <fieldset className={styles.reasons}>
        <legend className="sr-only">เหตุผลในการรายงาน</legend>
        {REPORT_REASONS.map((value) => (
          <label key={value} className={styles.option}>
            <input
              type="radio"
              name="report-reason"
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
              disabled={submitting}
            />
            <span>
              <span className={styles.optionLabel}>{REPORT_REASON_LABELS[value]}</span>
              <span className={styles.optionHint}>{REPORT_REASON_HINTS[value]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
