"use client";

import { useState } from "react";
import { Select } from "@/components/kin/Field";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysIn = (year: number, month: number) => new Date(year || 2000, month, 0).getDate();
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Date of birth as three of the design's selects (Day / Month / Year). `value` and `onChange` use ISO dates
 * ("1998-05-04"); a partly filled date reports "".
 */
export default function BirthDate({ id, value, onChange, minAge = 0, disabled = false, invalid = false }: { id: string; value: string; onChange: (iso: string) => void; minAge?: number; disabled?: boolean; invalid?: boolean }) {
  const [y0, m0, d0] = (value || "").split("-").map(Number);
  const [parts, setParts] = useState({ day: d0 || 0, month: m0 || 0, year: y0 || 0 });
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 101 - minAge }, (_, i) => thisYear - minAge - i);
  const maxDay = parts.month ? daysIn(parts.year, parts.month) : 31;

  const update = (patch: Partial<typeof parts>) => {
    const next = { ...parts, ...patch };
    if (next.day > (next.month ? daysIn(next.year, next.month) : 31)) next.day = 0;
    setParts(next);
    onChange(next.day && next.month && next.year ? `${next.year}-${pad(next.month)}-${pad(next.day)}` : "");
  };

  return (
    <div className="ch-set__dob" role="group" aria-labelledby={`${id}-label`}>
      <Select id={id} aria-label="Day" value={parts.day || ""} disabled={disabled} invalid={invalid} onChange={(e) => update({ day: Number(e.target.value) })}>
        <option value="">Day</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
      </Select>
      <Select aria-label="Month" value={parts.month || ""} disabled={disabled} invalid={invalid} onChange={(e) => update({ month: Number(e.target.value) })}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </Select>
      <Select aria-label="Year" value={parts.year || ""} disabled={disabled} invalid={invalid} onChange={(e) => update({ year: Number(e.target.value) })}>
        <option value="">Year</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </Select>
    </div>
  );
}
