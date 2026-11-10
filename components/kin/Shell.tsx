"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import { MemberProvider } from "@/components/shell/MemberContext";
import Companion from "@/components/shell/Companion";
import Header, { useLayout } from "./Header";
import Toaster from "./Toast";
import { ViewTransitions } from "./ViewTransitions";
import { useReveal } from "./useReveal";

const PUBLIC = ["/landing", "/login", "/signup", "/about", "/about/philosophy", "/welcome"];
/** Full-screen tools in the design (a project's canvas or document, and its meetings): signed in, but no header or Create AI. */
const FULL = /^\/collaborate\/my-projects\/[^/]+\/(workspace|meet)(\/|$)/;

/** The frame for redesigned pages: the shared app header, the page, and Create AI. Public pages get no frame. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const open = PUBLIC.includes(pathname) || pathname.startsWith("/circles/join/");
  const [gate, setGate] = useState<"checking" | "in" | "out">("checking");
  useEffect(() => {
    const signedIn = isSignedIn();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser session once per route
    setGate(signedIn ? "in" : "out");
    if (!signedIn && !open) router.replace("/landing");
  }, [pathname, open, router]);
  useEffect(() => { recordRoute(pathname); }, [pathname]);

  if (open) return <ViewTransitions>{children}</ViewTransitions>;
  if (gate !== "in") return <div style={{ minHeight: "100dvh" }} aria-busy="true" />;
  if (FULL.test(pathname)) return <MemberProvider><Toaster />{children}</MemberProvider>;
  return (
    <MemberProvider>
      <ViewTransitions>
        <Frame pathname={pathname}>{children}</Frame>
      </ViewTransitions>
    </MemberProvider>
  );
}

function Frame({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const layout = useLayout();
  useReveal();
  return (
    <div className="app" data-layout={layout} data-ready="true">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="app__main" tabIndex={-1}>
        <div className="route-stage" key={pathname}>{children}</div>
      </main>
      <Companion />
      <Toaster />
    </div>
  );
}
