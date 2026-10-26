"use client";

import { useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { fileSize } from "@/lib/collab/proof";
import type { ProofFile } from "@/lib/collab/types";

export const MAX_BYTES = 5 * 1024 * 1024;

/** A file picker that also takes a drop. Files stay on the device in the demo; only the name and size are kept. */
export function Drop({ accept, multiple, label, sub, onFiles, disabled }: { accept: string; multiple?: boolean; label: string; sub: string; onFiles: (f: File[]) => void; disabled?: boolean }) {
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label
      className={`co-drop${over ? " over" : ""}${disabled ? " off" : ""}`}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) onFiles([...e.dataTransfer.files]); }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} disabled={disabled} className="sr-only" onChange={(e) => { onFiles([...(e.target.files ?? [])]); if (ref.current) ref.current.value = ""; }} />
      <span className="ic"><Icon name="upload" size={22} /></span>
      <b>{label}</b>
      <small>{sub}</small>
    </label>
  );
}

export function accepts(f: File, accept: string) {
  return accept.split(",").some((a) => {
    const t = a.trim().toLowerCase();
    if (t.startsWith(".")) return f.name.toLowerCase().endsWith(t);
    if (t.endsWith("/*")) return f.type.startsWith(t.slice(0, -1));
    return f.type === t;
  });
}

export function toProof(f: File, kind: ProofFile["kind"]): ProofFile {
  return { id: `${kind}-${f.name}-${f.size}`, name: f.name, size: f.size, type: f.type || f.name.split(".").pop() || "", kind };
}

export function FileRow({ f, onRemove }: { f: ProofFile; onRemove?: () => void }) {
  const ext = f.name.includes(".") ? f.name.split(".").pop()!.toUpperCase() : "FILE";
  return (
    <li className="co-item">
      <span className="ic doc">{ext.slice(0, 4)}</span>
      <span className="t"><b>{f.name}</b><small>{fileSize(f.size)}</small></span>
      {onRemove && <button type="button" className="x" aria-label={`Remove ${f.name}`} onClick={onRemove}><Icon name="close" size={18} /></button>}
    </li>
  );
}
