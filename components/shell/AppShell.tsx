"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import Header from "@/components/kin/Header";
import Companion from "./Companion";
import { isActive } from "./nav";
import { MemberProvider } from "./MemberContext";

/**
 * The frame for pages not yet rebuilt in the kin system. Same header and Create AI as the kin pages
 * (components/kin/Header.tsx brings its own styles), so moving between old and new pages looks like one app.
 * The earlier frames (night rail, warm sidebar) stay in the repo: Rail.tsx, CommandBar.tsx, Sidebar.tsx, Topbar.tsx.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const open = ["/landing", "/login", "/signup", "/about", "/about/philosophy", "/welcome"].includes(pathname) || pathname.startsWith("/circles/join/");
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
  // Pages restyled by remapping the older tokens inside a calm scope. One accent for all of them now: the deep
  // amber of the brand (it carries white text and reads as text on white, which the old per-page colours were for).
  const CALM = ["/kindred", "/play", "/activities", "/studio", "/journal", "/store", "/shop", "/studios", "/stories", "/wellbeing", "/dna", "/applications", "/profile"];
  const calm = CALM.some((p) => isActive(pathname, p));
  // Chat screens: on phones they fill the screen like a messaging app (see mobile.css).
  const chat = /^\/(circles\/(?!new$)[^/]+|rooms\/(?!new$)[^/]+|banter\/(?!classic|now|new)[^/]+|banter\/now\/[^/]+)$/.test(pathname);
  const ankara = calm || pathname === "/" || pathname.startsWith("/circles") || pathname === "/cliqs" || pathname.startsWith("/banter") || pathname.startsWith("/rooms");

  return (
    <MemberProvider>
      <Header />
      <div className={`app nx ak-framed${night ? " is-night" : ""}${ankara ? " is-ankara" : ""}${pathname.startsWith("/atelier") || pathname === "/community" ? " is-bleed" : ""}${chat ? " is-chat" : ""}`}>
        <main className="main">
          <div className="content" id="main">
            {calm ? <div className="ap ap-calm ap-page" style={{ ["--c" as string]: "#995A0A" } as React.CSSProperties}>{children}</div> : children}
          </div>
        </main>
      </div>
      <Companion />
    </MemberProvider>
  );
}
