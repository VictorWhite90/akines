"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Add, Notification, SearchNormal1 } from "iconsax-reactjs";
import CreateChooser from "./CreateChooser";
import ThemeToggle from "./ThemeToggle";
import { isActive } from "./nav";
import { RAIL, activeGroup } from "./railGroups";
import Avatar from "@/components/ui/Avatar";
import { ME, allPeople } from "@/lib/data/people";
import { CIRCLES, ROOMS } from "@/lib/data/community";
import { BANTERS } from "@/lib/data/banter";
import { GAMES } from "@/lib/data/games";

const INDEX = [
  ...allPeople.map((p) => ({ label: p.name, kind: p.role, href: "/kindred" })),
  ...CIRCLES.map((c) => ({ label: c.name, kind: "Circle", href: `/circles/${c.id}` })),
  ...ROOMS.map((r) => ({ label: r.title, kind: "Presence Room", href: `/rooms/${r.id}` })),
  ...BANTERS.map((b) => ({ label: b.prompt, kind: "Banter", href: `/banter/${b.id}` })),
  ...GAMES.map((g) => ({ label: g.name, kind: "Game", href: `/play/${g.id}` })),
  ...RAIL.flatMap((g) => g.items.map((i) => ({ label: i.label, kind: g.label, href: i.href }))),
];

/** Top bar: where you are, one box to search or ask, and Create. */
export default function CommandBar({ onIntent, onCompanion, onMenu }: { onIntent: () => void; onCompanion: () => void; onMenu: () => void }) {
  const pathname = usePathname();
  const group = activeGroup(pathname);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [begin, setBegin] = useState(false);
  const [searching, setSearching] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setFocus(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? INDEX.filter((r) => r.label.toLowerCase().includes(t) || r.kind.toLowerCase().includes(t)).slice(0, 7) : [];
  }, [q]);

  return (
    <header className={`nx-top${searching ? " is-searching" : ""}`}>
      {/* Phones only: avatar (opens the menu drawer), the mark in the middle, search and notifications. */}
      <button className="nx-m-me" onClick={onMenu} aria-label="Open menu" aria-haspopup="dialog"><Avatar person={ME} size={32} /></button>
      <Link href="/" className="nx-m-logo" aria-label="Akines home">
        {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
        <img src="/akines/mark.png" alt="" width={28} height={28} />
      </Link>

      <nav className="nx-crumbs" aria-label={group.label}>
        {group.items.map((i) => {
          const on = i.href === "/" ? pathname === "/" : isActive(pathname, i.href);
          return <Link key={i.href} href={i.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>{i.label}</Link>;
        })}
      </nav>

      <div className="nx-ask" ref={box}>
        <SearchNormal1 size={18} color="currentColor" aria-hidden />
        <input autoFocus={searching} aria-label="Search Akines or ask the Companion" placeholder="Search people, Banters, games… or ask" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} />
        {focus && q.trim() && (
          <div className="nx-results">
            {results.map((r) => (
              <Link key={r.href + r.label} href={r.href} onClick={() => { setFocus(false); setQ(""); setSearching(false); }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                <small>{r.kind}</small>
              </Link>
            ))}
            <button onClick={() => { setFocus(false); onCompanion(); }} style={{ width: "100%", textAlign: "left", border: 0, background: "none", cursor: "pointer", padding: "9px 12px", borderRadius: 12, color: "var(--nx-brass)", font: "600 13.5px var(--nx-sans)" }}>
              ✦ Ask the Companion about “{q.trim()}”
            </button>
          </div>
        )}
      </div>

      <button className="nx-m-icon nx-m-search" aria-label={searching ? "Close search" : "Search"} onClick={() => { setSearching((v) => !v); setQ(""); }}>
        {searching ? <span aria-hidden style={{ fontSize: 22, lineHeight: 1 }}>×</span> : <SearchNormal1 size={21} color="currentColor" />}
      </button>
      <button className="nx-icon" aria-label="Ask the Akines Companion" title="Akines Companion" onClick={onCompanion}>✦</button>
      <span className="nx-theme"><ThemeToggle /></span>
      <button className="nx-icon nx-bell" aria-label="Notifications" title="Notifications">
        <Notification size={20} color="currentColor" />
        <span className="nx-rail-dot" style={{ top: 9, right: 10 }} aria-hidden />
      </button>
      <button className="nx-begin" onClick={() => setBegin(true)} aria-haspopup="dialog">
        <Add size={20} color="currentColor" /><span>Create</span>
      </button>
      <CreateChooser open={begin} onClose={() => setBegin(false)} onIntent={onIntent} />
    </header>
  );
}
