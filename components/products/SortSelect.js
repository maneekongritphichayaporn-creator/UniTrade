'use client';

import { SORT_OPTIONS } from '@/lib/client/format.js';

export function SortSelect({ value, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
        เรียงตาม
      </span>
      <select
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ minWidth: 150 }}
        aria-label="เรียงลำดับผลการค้นหา"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
