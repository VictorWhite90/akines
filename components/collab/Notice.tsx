"use client";

import { useEffect } from "react";
import { useCollab } from "@/lib/collab/useCollab";

/** What didn't save, said plainly for a few seconds (real builds; the demo never fails). */
export default function CollabNotice() {
  const { notice, clearNotice } = useCollab();
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(clearNotice, 6000);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);
  if (!notice) return null;
  return (
    <div className="co-notice" role="alert">
      <span>{notice}</span>
      <button type="button" onClick={clearNotice} aria-label="Dismiss">OK</button>
    </div>
  );
}
