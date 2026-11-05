import { statusLabel } from '@/lib/client/format.js';

// สีป้ายตามที่ตกลงใน TASK-14: available เขียว · reserved เหลือง/ส้ม · sold เทา
export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{statusLabel(status)}</span>;
}
