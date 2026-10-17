"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
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

  const router = useRouter();
  const open = ["/login", "/signup", "/about", "/welcome"].includes(pathname);
  const [gate, setGate] = useState<"checking" | "in" | "out">("checking");

  // Prototype gate: signed-out visitors meet the Welcome screen first.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser session once per route
    setGate(isSignedIn() ? "in" : "out");
  }, [pathname]);
  useEffect(() => {
    if (gate === "out" && !open) router.replace("/welcome");
  }, [gate, open, router]);

  // Sign-in, sign-up, welcome, the KinCircle creation wizard and the public About page are full-screen, without the shell.
  if (open || pathname === "/circles/new") return <>{children}</>;
  if (gate !== "in") return <div className="gate-wait" aria-busy="true" />;

  const night = pathname === "/constellation" || pathname.startsWith("/layouts");
  // Pages restyled by remapping the older tokens inside a calm scope, each with its own accent.
  const CALM: [string, string][] = [["/kindred", "#2547d0"], ["/play", "#ff6b1a"], ["/activities", "#00a86b"], ["/collaborate", "#2547d0"], ["/messages", "#7b2ff7"], ["/studio", "#7b2ff7"], ["/journal", "#00a86b"], ["/store", "#7b2ff7"], ["/shop", "#7b2ff7"], ["/studios", "#7b2ff7"], ["/stories", "#e5007e"], ["/wellbeing", "#00a86b"], ["/dna", "#2547d0"], ["/applications", "#2547d0"]];
  const calm = CALM.find(([p]) => isActive(pathname, p));
  const ankara = !!calm || pathname === "/" || pathname.startsWith("/circles") || pathname === "/cliqs" || pathname.startsWith("/banter") || pathname.startsWith("/rooms");

  return (
    <div className={`app nx${night ? " is-night" : ""}${ankara ? " is-ankara" : ""}${pathname.startsWith("/atelier") || pathname === "/community" ? " is-bleed" : ""}`}>
      <Rail />
      <main className="main">
        <CommandBar onIntent={() => setIntent(true)} onCompanion={() => setCompanion(true)} />
        <div className="content" id="main">
          {calm ? <div className="ap ap-calm ap-page" style={{ ["--c" as string]: calm[1] } as React.CSSProperties}>{children}</div> : children}
        </div>
      </main>

      <nav className="nx-dock" aria-label="Quick navigation">
        <Link href="/" className={pathname === "/" ? "on" : undefined}><Star1 size={22} color="currentColor" />Home</Link>
        <Link href="/banter" className={isActive(pathname, "/banter") ? "on" : undefined}><Messages2 size={22} color="currentColor" />Banter</Link>
        <button className="center" onClick={() => setBegin(true)} aria-label="Create"><Add size={26} color="currentColor" /></button>
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
