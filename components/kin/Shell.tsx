"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import { MemberProvider } from "@/components/shell/MemberContext";
import Companion from "@/components/shell/Companion";
import Header from "./Header";
import { ViewTransitions } from "./ViewTransitions";

const PUBLIC = ["/landing", "/login", "/signup", "/about", "/about/philosophy", "/welcome"];

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
    if (!signedIn && !open) router.replace("/about");
  }, [pathname, open, router]);
  useEffect(() => { recordRoute(pathname); }, [pathname]);

  if (open) return <ViewTransitions>{children}</ViewTransitions>;
  if (gate !== "in") return <div style={{ minHeight: "100dvh" }} aria-busy="true" />;
  return (
    <MemberProvider>
      <ViewTransitions>
        <div className="k-shell">
          <Header />
          <main className="k-main" id="main">{children}</main>
          <Companion />
        </div>
      </ViewTransitions>
    </MemberProvider>
  );
}
