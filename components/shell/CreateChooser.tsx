"use client";

import Link from "next/link";
import { useEffect } from "react";

/** The four shapes a connection can take, then everything else you can make. */
const SHAPES = [
  { glyph: "❝", label: "Start a Banter", body: "Ask one honest question to the right people.", href: "/banter#compose" },
  { glyph: "◎", label: "Create a KinCircle", body: "Guide a small group through a meaningful journey.", href: "/circles/new" },
  { glyph: "◉", label: "Host a Presence Room", body: "Bring six people into one live conversation.", href: "/rooms/new" },
  { glyph: "⌘", label: "Start a Collaboration", body: "Turn shared intention into fair, visible work.", href: "/collaborate" },
];

const MORE = [
  { glyph: "☺", label: "Create a game", href: "/play/new" },
  { glyph: "◌", label: "Make a Cliq", href: "/cliqs" },
  { glyph: "✦", label: "Open my studio", href: "/studio" },
  { glyph: "▣", label: "Add a product", href: "/store" },
  { glyph: "▤", label: "Write a journal entry", href: "/journal" },
];

export default function CreateChooser({ open, onClose, onIntent }: { open: boolean; onClose: () => void; onIntent: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-night/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="What do you want to begin?">
      <div className="w-full max-w-[680px] rounded-[28px] bg-paper-50 p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-clay-600 uppercase">Choose the right shape</p>
            <h2 className="font-display mt-1 text-[30px] leading-tight">What do you want to begin?</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-paper-200 text-[18px] hover:bg-paper-300">×</button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SHAPES.map((s) => (
            <Link key={s.href} href={s.href} onClick={onClose} className="rounded-[18px] border border-line bg-white p-4 transition-colors hover:border-ink-950 hover:bg-paper-100">
              <p className="flex items-center gap-2 text-[15px] font-semibold"><span aria-hidden>{s.glyph}</span>{s.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-mute">{s.body}</p>
            </Link>
          ))}
        </div>

        <p className="mt-5 text-[12px] font-semibold text-mute">Or make something</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MORE.map((m) => (
            <Link key={m.href} href={m.href} onClick={onClose} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] hover:border-ink-400">
              <span aria-hidden>{m.glyph}</span>{m.label}
            </Link>
          ))}
        </div>

        <button onClick={() => { onClose(); onIntent(); }} className="mt-5 w-full rounded-[16px] bg-paper-200 px-4 py-3 text-left text-[13px] hover:bg-paper-300">
          <span className="font-semibold">Not sure?</span> Tell us what would feel meaningful and we&apos;ll suggest a first step →
        </button>
      </div>
    </div>
  );
}
