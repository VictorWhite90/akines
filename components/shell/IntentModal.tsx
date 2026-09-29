"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { INTENTS } from "@/lib/data/community";

/** "Why are you here?": the Connection Intent Engine from the concept note. */
export default function IntentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [id, setId] = useState<string | null>(null);
  const intent = INTENTS.find((i) => i.id === id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`modal${open ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Why are you here today?">
      <div className="modal-card">
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <div className="ac-eyebrow">Why are you here today?</div>
        <h2>Tell us your reason, and the courtyard rearranges itself.</h2>
        <p>Your intent shapes suggestions only. You can change it anytime, and it's never shown on your profile.</p>
        <div className="intent-grid" role="radiogroup" aria-label="Your reason for being here">
          {INTENTS.map((i) => (
            <button key={i.id} role="radio" aria-checked={id === i.id} className={`intent${id === i.id ? " chosen" : ""}`} onClick={() => setId(i.id)}>
              {i.label}
            </button>
          ))}
        </div>
        {intent && (
          <div className="intent-answer">
            <h3>{intent.headline}</h3>
            <p>{intent.body}</p>
            <Link href={intent.cta.href} onClick={onClose}>{intent.cta.label} →</Link>
          </div>
        )}
        <button className="primary" onClick={onClose}>{intent ? "Continue with this reason" : "Skip for now"}</button>
      </div>
    </div>
  );
}
