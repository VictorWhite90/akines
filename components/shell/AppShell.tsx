"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO } from "@/lib/demo/mode";
import { isSignedIn, signOut } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import { Add, Game, Home2, Message, Messages2, People } from "iconsax-reactjs";
import CommandBar from "./CommandBar";
import Companion from "./Companion";
import CreateChooser from "./CreateChooser";
import IntentModal from "./IntentModal";
import Rail from "./Rail";
import Drawer from "./Drawer";
import { isActive } from "./nav";
import { MemberProvider } from "./MemberContext";

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
  const open = ["/login", "/signup", "/about", "/about/philosophy", "/welcome"].includes(pathname) || pathname.startsWith("/circles/join/");
  const [gate, setGate] = useState<"checking" | "in" | "out">("checking");

  // Check the live cookie on every route change; signup can authenticate without changing its pathname.
  useEffect(() => {
    const signedIn = isSignedIn();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser session once per route
    setGate(signedIn ? "in" : "out");
    if (!signedIn && !open) router.replace("/about");
  }, [pathname, open, router]);
  useEffect(() => {
    recordRoute(pathname);
  }, [pathname]);
  // After signing in from an invite link, finish joining that community.
  useEffect(() => {
    if (gate !== "in") return;
    try {
      const code = localStorage.getItem("ak:pending-invite");
      if (code) {
        localStorage.removeItem("ak:pending-invite");
        router.replace(`/circles/join/${code}`);
      }
    } catch {}
  }, [gate, router]);
  // Sign-in, sign-up, welcome, the KinCircle creation wizard and the public About page are full-screen, without the shell.
  if (open || pathname === "/circles/new") return <>{children}</>;
  if (gate !== "in") return <div className="gate-wait" aria-busy="true" />;

  const night = pathname === "/constellation" || pathname.startsWith("/layouts");
  // Pages restyled by remapping the older tokens inside a calm scope, each with its own accent.
  const CALM: [string, string][] = [["/kindred", "#2547d0"], ["/play", "#ff6b1a"], ["/activities", "#00a86b"], ["/messages", "#7b2ff7"], ["/studio", "#7b2ff7"], ["/journal", "#00a86b"], ["/store", "#7b2ff7"], ["/shop", "#7b2ff7"], ["/studios", "#7b2ff7"], ["/stories", "#e5007e"], ["/wellbeing", "#00a86b"], ["/dna", "#2547d0"], ["/applications", "#2547d0"], ["/profile", "#2547d0"]];
  const calm = CALM.find(([p]) => isActive(pathname, p));
  // Chat screens: on phones they fill the screen like a messaging app (see mobile.css).
  const chat = /^\/(circles\/(?!new$)[^/]+|rooms\/(?!new$)[^/]+|banter\/(?!classic|now|new)[^/]+|banter\/now\/[^/]+)$/.test(pathname);
  const ankara = !!calm || pathname === "/" || pathname.startsWith("/circles") || pathname === "/cliqs" || pathname.startsWith("/banter") || pathname.startsWith("/rooms");

  return (
    <MemberProvider>
      <div className={`app nx${night ? " is-night" : ""}${ankara ? " is-ankara" : ""}${pathname.startsWith("/atelier") || pathname === "/community" ? " is-bleed" : ""}${chat ? " is-chat" : ""}`}>
        <Rail />
        <main className="main">
          {DEMO && (
            <div className="guest-preview" role="status">
              <span><strong>Demo</strong> · Sample data in your browser. Nothing here reaches Akines.</span>
              <button type="button" onClick={() => void import("@/lib/demo/backend").then((d) => { d.resetDemo(); window.location.assign("/login"); })}>Reset demo</button>
              <button type="button" onClick={() => void signOut().then(() => router.replace("/about"))}>Sign out</button>
            </div>
          )}
          <CommandBar onIntent={() => setIntent(true)} onCompanion={() => setCompanion(true)} onMenu={() => setMore(true)} />
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
            { href: "/play", label: "Play Together", Icon: Game, on: isActive(pathname, "/play") },
            { href: "/messages", label: "KinMessage", Icon: Message, on: isActive(pathname, "/messages") },
          ].map(({ href, label, Icon, on }) => (
            <Link key={href} href={href} className={on ? "on" : undefined} aria-label={label} aria-current={on ? "page" : undefined}>
              <Icon size={24} color="currentColor" variant={on ? "Bold" : "Linear"} />
            </Link>
          ))}
        </nav>
        {/* Hidden in KinMessage, where it would sit on top of the Send button. */}
        {/* Hidden where the page has its own composer, so it never covers a Send button. */}
        {!isActive(pathname, "/messages") && !pathname.includes("/events/") && !pathname.includes("/check-in/") && !pathname.startsWith("/circles/community/") && <button className="nx-fab" onClick={() => setBegin(true)} aria-label="Create" aria-haspopup="dialog"><Add size={26} color="currentColor" /></button>}

        <Drawer open={more} onClose={() => setMore(false)} onCompanion={() => setCompanion(true)} />
        <CreateChooser open={begin} onClose={() => setBegin(false)} onIntent={() => setIntent(true)} />
        <IntentModal open={intent} onClose={() => setIntent(false)} />
        <Companion open={companion} onClose={() => setCompanion(false)} />
      </div>
    </MemberProvider>
  );
}
