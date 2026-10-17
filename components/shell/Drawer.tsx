"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InfoCircle, LogoutCurve, Magicpen } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { ME } from "@/lib/data/people";
import ThemeToggle from "./ThemeToggle";
import { isActive } from "./nav";
import { RAIL, activeGroup } from "./railGroups";

/** Phones: tapping your photo slides this in from the left, like X. Same places as the web rail. */
export default function Drawer({ open, onClose, onCompanion }: { open: boolean; onClose: () => void; onCompanion: () => void }) {
  const pathname = usePathname();
  const current = activeGroup(pathname);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal needs document.body, which only exists after mount
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={`dr-scrim${open ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()} aria-hidden={!open}>
      <aside className="dr" role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <header className="dr-me">
          <Link href="/dna" onClick={onClose} className="dr-ava" aria-label="Your profile"><Avatar person={ME} size={48} /></Link>
          <Link href="/dna" onClick={onClose} className="dr-name">
            <b>{ME.name}</b>
            <small>{ME.role} · {ME.city}</small>
          </Link>
          <p className="dr-stats"><span><b>3</b> circles</span><span><b>2</b> introductions</span><span><b>8</b> Banters</span></p>
        </header>

        <nav className="dr-nav" aria-label="Places">
          {RAIL.map((g) => (
            <section key={g.id} className={`dr-group${current.id === g.id ? " on" : ""}`}>
              <p className="dr-label"><g.Icon size={16} color="currentColor" variant={current.id === g.id ? "Bold" : "Linear"} />{g.label}</p>
              {g.items.map((i) => {
                const on = i.href === "/" ? pathname === "/" : isActive(pathname, i.href);
                return (
                  <Link key={i.href} href={i.href} onClick={onClose} className={`dr-link${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
                    <span className="g" aria-hidden>{i.glyph}</span>
                    <span className="t">{i.label}</span>
                    {i.badge && <span className="b">{i.badge}</span>}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>

        <footer className="dr-foot">
          <button className="dr-companion" onClick={() => { onClose(); onCompanion(); }}><Magicpen size={18} color="currentColor" />Ask the Akines Companion</button>
          <div className="dr-row">
            <Link href="/about" onClick={onClose}><InfoCircle size={18} color="currentColor" />About</Link>
            <Link href="/welcome?signout=1" onClick={onClose}><LogoutCurve size={18} color="currentColor" />Sign out</Link>
            <span className="dr-theme"><ThemeToggle /></span>
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
