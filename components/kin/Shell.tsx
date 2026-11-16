"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import { MemberProvider } from "@/components/shell/MemberContext";
import Companion from "@/components/shell/Companion";
import Header, { SideNav } from "./Header";
import { mobileRoute } from "./mobileRoutes";
import { useLayout } from "./useLayout";
import Toaster from "./Toast";
import { ViewTransitions } from "./ViewTransitions";
import { useReveal } from "./useReveal";

const PUBLIC = ["/landing", "/login", "/signup", "/pages"];
/** Full-screen tools in the design (a project's canvas or document, and its meetings): signed in, but no header or Create AI. */
const FULL = /^\/collaborate\/my-projects\/[^/]+\/(workspace|meet)(\/|$)/;

/** The frame for redesigned pages: the shared app header, the page, and Create AI. Public pages get no frame. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const open = PUBLIC.includes(pathname);
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

/**
 * Phones without the bottom bar (chat threads) have a composer pinned at the bottom instead. Its height is published as
 * `--m-composer-h` on <html> so the Create AI launcher can sit above it. The composer is found by `data-mobile-composer`
 * (or the Community `.ch-composer`).
 */
function useComposerHeight(active: boolean, path: string) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.dataset.mBottombar = "off";
    let el: Element | null = null;
    let ro: ResizeObserver | null = null;
    const attach = () => {
      const next = document.querySelector("[data-mobile-composer]") ?? document.querySelector(".ch-composer");
      if (next === el) return;
      ro?.disconnect();
      ro = null;
      el = next;
      if (!el) {
        html.style.removeProperty("--m-composer-h");
        return;
      }
      const measure = () => {
        if (el) html.style.setProperty("--m-composer-h", `${Math.round(el.getBoundingClientRect().height)}px`);
      };
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(el);
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      ro?.disconnect();
      delete html.dataset.mBottombar;
      html.style.removeProperty("--m-composer-h");
    };
  }, [active, path]);
}

function Frame({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const layout = useLayout();
  useReveal();
  // Phones follow the page's phone settings: bar "top" shows the top bar instead of the header, bottomBar false hides the bottom bar.
  const phone = layout === "mobile";
  const mobile = mobileRoute(pathname);
  const topBar = phone && mobile?.bar === "top";
  const noBottomBar = phone && mobile?.bottomBar === false;
  useComposerHeight(noBottomBar, pathname);
  return (
    <div className="app" data-layout={layout} data-ready="true" data-bar={topBar ? "top" : undefined} data-bottombar={noBottomBar ? "off" : undefined}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header mobile={mobile} />
      {/* Desktop: the section bar on the left beside the page. Elsewhere .app__body is display: contents (header.css). */}
      <div className="app__body">
        {layout === "desktop" ? <SideNav /> : null}
        <main id="main" className="app__main" tabIndex={-1}>
          <div className="route-stage" key={pathname}>{children}</div>
        </main>
      </div>
      <Companion />
      <Toaster />
    </div>
  );
}
