"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Modal on desktop, bottom sheet on phones. */
export default function Sheet({ title, sub, onClose, children, wide }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only after mount
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  if (!mounted) return null;
  return createPortal(
    <div className="cm-scrim" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`cm-sheet kh${wide ? " wide" : ""}`}>
        <header className="cm-sheet-head">
          <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="cm-sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
