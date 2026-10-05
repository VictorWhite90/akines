"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Companion from "./Companion";
import IntentModal from "./IntentModal";
import { isActive } from "./nav";

const MOBILE = [
  { href: "/", label: "Home", glyph: "⌂" },
  { href: "/rooms", label: "Rooms", glyph: "◉" },
  { href: "/circles", label: "Circles", glyph: "◎" },
  { href: "/shop", label: "Shop", glyph: "□" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [companion, setCompanion] = useState(false);
  const [intent, setIntent] = useState(false);

  // Sign-in and sign-up are full-screen flows, without the sidebar or topbar.
  if (pathname === "/login" || pathname === "/signup") return <>{children}</>;

  return (
    <div className="app">
      <Sidebar open={menu} onNavigate={() => setMenu(false)} />
      {menu && <div style={{ position: "fixed", inset: 0, background: "rgba(21,16,11,.5)", zIndex: 80 }} onClick={() => setMenu(false)} aria-hidden />}
      <main className="main">
        <Topbar onIntent={() => setIntent(true)} onCompanion={() => setCompanion(true)} />
        <div className="content" id="main">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Quick navigation">
        {MOBILE.map((m) => (
          <Link key={m.href} href={m.href} className={isActive(pathname, m.href) ? "active" : undefined}>
            <span className="g" aria-hidden>{m.glyph}</span>
            {m.label}
          </Link>
        ))}
        <button onClick={() => setMenu(true)} aria-label="More">
          <span className="g" aria-hidden>≡</span>More
        </button>
      </nav>

      <IntentModal open={intent} onClose={() => setIntent(false)} />
      <Companion open={companion} onClose={() => setCompanion(false)} />
    </div>
  );
}
