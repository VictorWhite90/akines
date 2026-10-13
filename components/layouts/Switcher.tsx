"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LAYOUTS = [
  { href: "/layouts/panes", label: "A · Stacked panes", hint: "Click anything: it opens beside, never replaces." },
  { href: "/layouts/stage", label: "B · Stage + people dock", hint: "Pick what's on stage; tap people in the dock to bring them in." },
  { href: "/layouts/today", label: "C · Today + bento", hint: "A day that ends, beside a board of your spaces." },
];

/** Top strip to compare the three layout ideas. */
export default function Switcher() {
  const pathname = usePathname();
  const current = LAYOUTS.find((l) => l.href === pathname);
  return (
    <div className="lx-switch">
      <p>Layout preview</p>
      {LAYOUTS.map((l) => (
        <Link key={l.href} href={l.href} className={l.href === pathname ? "on" : undefined}>{l.label}</Link>
      ))}
      {current && <span>{current.hint}</span>}
    </div>
  );
}
