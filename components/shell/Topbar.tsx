"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { allPeople } from "@/lib/data/people";
import { CIRCLES, ROOMS } from "@/lib/data/community";
import { STORIES } from "@/lib/data/stories";
import CreateChooser from "./CreateChooser";

const INDEX = [
  ...allPeople.map((p) => ({ label: p.name, kind: p.role, href: "/kindred" })),
  ...CIRCLES.map((c) => ({ label: c.name, kind: "Circle", href: `/circles/${c.id}` })),
  ...ROOMS.map((r) => ({ label: r.title, kind: "Presence Room", href: `/rooms/${r.id}` })),
  { label: "Marketplace", kind: "Shop", href: "/shop" },
  { label: "My store", kind: "Sell your work", href: "/store" },
  { label: "My studio", kind: "Your studio", href: "/studio" },
  { label: "Create a room", kind: "Presence Room", href: "/rooms/new" },
  { label: "Banter", kind: "Talk freely", href: "/banter" },
  { label: "Start a Banter", kind: "Banter", href: "/banter#start" },
  { label: "Play Together", kind: "Games", href: "/play" },
  { label: "Create a game", kind: "Play Together", href: "/play/new" },
  { label: "Cliqs", kind: "Your people", href: "/cliqs" },
  ...STORIES.map((s) => ({ label: s.title, kind: s.kind, href: `/stories/${s.id}` })),
];


export default function Topbar({ onIntent, onCompanion }: { onIntent: () => void; onCompanion: () => void }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const menuBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setFocus(false);
    const m = (e: MouseEvent) => menuBox.current && !menuBox.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", h);
    document.addEventListener("mousedown", m);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("mousedown", m);
    };
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? INDEX.filter((r) => r.label.toLowerCase().includes(t) || r.kind.toLowerCase().includes(t)).slice(0, 6) : [];
  }, [q]);

  return (
    <header className="topbar">
      <Link href="/" className="topbar-brand" aria-label="Akines home">
        <Image src="/akines_logo_transparent.png" alt="Akines" width={168} height={45} />
      </Link>
      <div className="search" ref={box}>
        <input aria-label="Search Akines" placeholder="Search artists, stories, circles…" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} />
        <button aria-label="Search">⌕</button>
        {focus && q.trim() && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 18, padding: 6, boxShadow: "var(--shadow)" }}>
            {results.length === 0 ? (
              <p style={{ margin: 0, padding: "10px 14px", fontSize: 13, color: "var(--muted)" }}>Nothing yet for “{q}”. Try “textile”, “Accra” or “home”.</p>
            ) : (
              results.map((r) => (
                <Link key={r.href + r.label} href={r.href} onClick={() => { setFocus(false); setQ(""); }} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 14px", borderRadius: 12, fontSize: 13, color: "inherit", textDecoration: "none" }}>
                  <span>{r.label}</span>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{r.kind}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      <div className="top-actions">
        <button className="icon-btn" aria-label="Ask the Companion" title="Akines Companion" onClick={onCompanion}>✦</button>
        <button className="icon-btn" aria-label="Notifications" title="Notifications">♢</button>
        <div className="create-wrap" ref={menuBox}>
          <button className="primary" onClick={() => setMenu((v) => !v)} aria-haspopup="dialog" aria-expanded={menu}>＋ Create</button>
          <CreateChooser open={menu} onClose={() => setMenu(false)} onIntent={onIntent} />
        </div>
      </div>
    </header>
  );
}
