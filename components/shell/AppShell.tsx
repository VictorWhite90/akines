"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Add, Messages2, People, Star1 } from "iconsax-reactjs";
import CommandBar from "./CommandBar";
import Companion from "./Companion";
import CreateChooser from "./CreateChooser";
import IntentModal from "./IntentModal";
import Rail from "./Rail";
import { isActive } from "./nav";
import { RAIL } from "./railGroups";

/**
 * Night sky & brass shell: a slim rail, a command bar and a mobile dock.
 * The previous warm sidebar design (Sidebar.tsx, Topbar.tsx) is kept in the repo and on the
 * `design/warm-v1` branch in case we revert.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const [begin, setBegin] = useState(false);
  const [companion, setCompanion] = useState(false);
  const [intent, setIntent] = useState(false);

  // Sign-in, sign-up, the KinCircle creation wizard and the public About page are full-screen, without the shell.
  if (pathname === "/login" || pathname === "/signup" || pathname === "/circles/new" || pathname === "/about") return <>{children}</>;

  const night = pathname === "/constellation" || pathname.startsWith("/layouts");
  const ankara = pathname === "/";

  return (
    <div className={`app nx${night ? " is-night" : ""}${ankara ? " is-ankara" : ""}${pathname.startsWith("/atelier") || pathname === "/community" ? " is-bleed" : ""}`}>
      <Rail />
      <main className="main">
        <CommandBar onIntent={() => setIntent(true)} onCompanion={() => setCompanion(true)} />
        <div className="content" id="main">{children}</div>
      </main>

      <nav className="nx-dock" aria-label="Quick navigation">
        <Link href="/" className={pathname === "/" ? "on" : undefined}><Star1 size={22} color="currentColor" />Sky</Link>
        <Link href="/banter" className={isActive(pathname, "/banter") ? "on" : undefined}><Messages2 size={22} color="currentColor" />Banter</Link>
        <button className="center" onClick={() => setBegin(true)} aria-label="Begin something"><Add size={26} color="currentColor" /></button>
        <Link href="/circles" className={isActive(pathname, "/circles") ? "on" : undefined}><People size={22} color="currentColor" />Circles</Link>
        <button onClick={() => setMore(true)}><span style={{ fontSize: 20, lineHeight: "22px" }}>≡</span>More</button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/50" onClick={(e) => e.target === e.currentTarget && setMore(false)}>
          <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-[28px] p-5" style={{ background: "var(--nx-dusk)", color: "var(--nx-text)", fontFamily: "var(--nx-sans)" }}>
            {RAIL.map((g) => (
              <div key={g.id} className="mb-4">
                <p className="mb-2 text-[10.5px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--nx-brass)" }}>{g.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map((i) => (
                    <Link key={i.href} href={i.href} onClick={() => setMore(false)} className="rounded-2xl px-3.5 py-3 text-[14px]" style={{ background: "var(--nx-dusk-2)" }}>
                      <span className="mr-2 opacity-60">{i.glyph}</span>{i.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateChooser open={begin} onClose={() => setBegin(false)} onIntent={() => setIntent(true)} />
      <IntentModal open={intent} onClose={() => setIntent(false)} />
      <Companion open={companion} onClose={() => setCompanion(false)} />
    </div>
  );
}
