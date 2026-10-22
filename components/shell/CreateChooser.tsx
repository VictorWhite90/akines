"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Glyph } from "@/components/ui/Icon";

type Item = { glyph: string; label: string; body: string; href: string; color: string };

/** Everything a member can create on Akines, grouped by what they're trying to do. */
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Talk",
    items: [
      { glyph: "❝", label: "Banter", body: "One honest question, a small chat.", href: "/banter?new=chat", color: "#ffb000" },
      { glyph: "◉", label: "Live talk", body: "A voice Banter, now, 2–8 people.", href: "/banter?new=live", color: "#e5007e" },
      { glyph: "✉", label: "KinMessage", body: "A private chat with someone.", href: "/messages", color: "#7b2ff7" },
    ],
  },
  {
    title: "Gather",
    items: [
      { glyph: "◎", label: "KinCircle", body: "A small group on a journey.", href: "/circles/new", color: "#00a86b" },
      { glyph: "◌", label: "Cliq", body: "The 5–8 people you want to hear from.", href: "/cliqs", color: "#e09a00" },
      { glyph: "◐", label: "Presence Room", body: "Six seats, one live conversation.", href: "/rooms/new", color: "#e5007e" },
      { glyph: "☺", label: "Game", body: "Play together, live or slowly.", href: "/play/new", color: "#ff6b1a" },
    ],
  },
  {
    title: "Make",
    items: [
      { glyph: "⌘", label: "Collaboration", body: "Shared work with fair credit.", href: "/collaborate", color: "#2547d0" },
      { glyph: "✦", label: "My space", body: "Show your work, let people visit.", href: "/studio", color: "#7b2ff7" },
      { glyph: "▣", label: "Product", body: "Sell something in your store.", href: "/store", color: "#2547d0" },
      { glyph: "▤", label: "Journal entry", body: "For you, or for your people.", href: "/journal", color: "#00a86b" },
    ],
  },
];

export default function CreateChooser({ open, onClose, onIntent }: { open: boolean; onClose: () => void; onIntent: () => void }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal needs document.body, which only exists after mount
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Keep the page behind still while the menu is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  // Rendered on <body> so a blurred or transformed parent (the top bar) can't trap the fixed overlay.
  return createPortal(
    <div className="cc-scrim" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Create">
      <div className="cc">
        <span className="cc-grab" aria-hidden />
        <div className="cc-head">
          <div>
            <p>Create</p>
            <h2>What would you like to create?</h2>
          </div>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>

        {GROUPS.map((g) => (
          <section key={g.title} className="cc-group">
            <h3>{g.title}</h3>
            <div className="cc-grid">
              {g.items.map((i) => (
                <Link key={i.label} href={i.href} onClick={onClose} className="cc-item" style={{ ["--k" as string]: i.color } as React.CSSProperties}>
                  <span className="cc-ic" aria-hidden><Glyph g={i.glyph} size={20} /></span>
                  <span><b>{i.label}</b><small>{i.body}</small></span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <button onClick={() => { onClose(); onIntent(); }} className="cc-help">
          <b>Not sure?</b> Tell us what you need and we&apos;ll suggest where to start →
        </button>
      </div>
    </div>,
    document.body,
  );
}
