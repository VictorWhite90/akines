"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CloseCircle, HamburgerMenu } from "iconsax-reactjs";
import ChannelSidebar from "./ChannelSidebar";
import SpaceRail from "./SpaceRail";
import { currentSpace } from "./nav";

/**
 * The Village: a rail of spaces (your circles, the studio, opportunities, the
 * gallery), the channels of the space you're in, and the conversation or page
 * itself. On phones the rail and channels slide in from the left.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const space = currentSpace(pathname);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    <div className="flex h-dvh overflow-hidden bg-sand-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>

      <div className="hidden lg:flex">
        <SpaceRail space={space} />
        <ChannelSidebar space={space} pathname={pathname} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-sand-200 bg-night-900 px-3 text-white lg:hidden">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open spaces and channels" aria-expanded={drawer} className="cursor-pointer rounded-[6px] p-1.5 hover:bg-night-700">
            <HamburgerMenu size={22} color="currentColor" aria-hidden />
          </button>
          <span className="font-playfair text-lg font-bold">Artelia</span>
          <span className="text-xs text-night-muted">Connect</span>
        </div>
        <main id="main" className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Spaces and channels">
          <div className="flex h-full" onClickCapture={(e) => (e.target as Element).closest("a") && setDrawer(false)}>
            <SpaceRail space={space} />
            <ChannelSidebar space={space} pathname={pathname} />
          </div>
          <button type="button" aria-label="Close" onClick={() => setDrawer(false)} className="flex-1 cursor-default bg-night-950/60">
            <CloseCircle size={28} color="white" className="ml-auto mr-4 mt-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
