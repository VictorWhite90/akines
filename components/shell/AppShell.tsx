"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { Add, HamburgerMenu, Home2, Message, Messages2, People } from "iconsax-reactjs";
import CommandBar from "./CommandBar";
import Companion from "./Companion";
import CreateChooser from "./CreateChooser";
import IntentModal from "./IntentModal";
import Rail from "./Rail";
import ThemeToggle from "./ThemeToggle";
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
    if (gate === "out" && !open) router.replace("/login");
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

      {/* Phones: a flat, edge-to-edge tab bar (icons only) and a floating Create button. */}
      <nav className="nx-dock" aria-label="Quick navigation">
        {[
          { href: "/", label: "Home", Icon: Home2, on: pathname === "/" },
          { href: "/banter", label: "Banter", Icon: Messages2, on: isActive(pathname, "/banter") },
          { href: "/circles", label: "KinCircle", Icon: People, on: isActive(pathname, "/circles") },
          { href: "/messages", label: "KinMessage", Icon: Message, on: isActive(pathname, "/messages") },
        ].map(({ href, label, Icon, on }) => (
          <Link key={href} href={href} className={on ? "on" : undefined} aria-label={label} aria-current={on ? "page" : undefined}>
            <Icon size={24} color="currentColor" variant={on ? "Bold" : "Linear"} />
          </Link>
        ))}
        <button onClick={() => setMore(true)} aria-label="More"><HamburgerMenu size={24} color="currentColor" /></button>
      </nav>
      <button className="nx-fab" onClick={() => setBegin(true)} aria-label="Create" aria-haspopup="dialog"><Add size={26} color="currentColor" /></button>

      {more && (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/50" onClick={(e) => e.target === e.currentTarget && setMore(false)}>
          <div className="nx-more max-h-[80vh] w-full overflow-y-auto rounded-t-[24px] p-4" style={{ background: "var(--nx-dusk)", color: "var(--nx-text)", fontFamily: "var(--nx-sans)" }}>
            <div className="mb-4 flex items-center gap-2">
              <button onClick={() => { setMore(false); setCompanion(true); }} className="flex-1 rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold" style={{ background: "var(--nx-dusk-2)", color: "var(--nx-brass)" }}>✦ Ask the Akines Companion</button>
              <ThemeToggle />
            </div>
            {RAIL.map((g) => (
              <div key={g.id} className="mb-4">
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--nx-brass)" }}>{g.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map((i) => (
                    <Link key={i.href} href={i.href} onClick={() => setMore(false)} className="rounded-xl px-3 py-2.5 text-[13px]" style={{ background: "var(--nx-dusk-2)" }}>
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
