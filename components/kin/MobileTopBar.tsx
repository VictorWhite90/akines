"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { useLayout } from "./useLayout";

/*
 * The phone top bar on sub-pages (the design's app-shell/MobileTopBar.tsx). The Shell decides when it shows and what it says
 * (components/kin/mobileRoutes.ts); a page can fill its action slot with <MobileTopBarAction> and, when the title comes from
 * data (a thread's name, a project's name), set it with <MobileTopBarTitle>.
 */

/* A tiny shared store: the right slot of the bar (pages portal their action into it) and a title a page sets. */
let slot: HTMLElement | null = null;
let title: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const setSlot = (el: HTMLElement | null) => {
  if (slot === el) return;
  slot = el;
  emit();
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const useSlot = () => useSyncExternalStore(subscribe, () => slot, () => null);
const usePageTitle = () => useSyncExternalStore(subscribe, () => title, () => null);

/**
 * Phone top bar for sub-pages (Figma "Top Bar Mobile", Title align=Center): 56 high, back chevron (Top Bar Button / Mobile, 44 x 44),
 * centred title in Manrope Semi Bold 17, and a 44 x 44 action slot on the right that keeps the title centred when it is empty.
 * It sticks to the top like the mobile header.
 */
export function MobileTopBar({ title: fallback, back }: { title: string; back?: string }) {
  const fromPage = usePageTitle();
  return (
    <header className="mtb" data-layout="mobile">
      <div className="mtb__slot">
        {back ? (
          <Link href={back} className="mtb__btn" aria-label="Back">
            <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" focusable="false" />
          </Link>
        ) : null}
      </div>
      <p className="mtb__title">{fromPage ?? fallback}</p>
      <div className="mtb__slot mtb__slot--action" ref={setSlot} />
    </header>
  );
}

/**
 * Lets a page put its action (for example "Arrange a Create Call" as a calendar icon on a chat thread) into the right side of the
 * phone top bar. Renders nothing on tablet and desktop, or when the screen has no top bar.
 */
export function MobileTopBarAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  const layout = useLayout();
  const target = useSlot();
  if (layout !== "mobile" || !target) return null;
  return createPortal(
    <button type="button" className="mtb__btn" aria-label={label} onClick={onClick}>
      {icon}
    </button>,
    target,
  );
}

/** Sets the phone top bar's title from the page (for titles that come from data). Renders nothing; the title clears when it unmounts. */
export function MobileTopBarTitle({ title: t }: { title: string | null | undefined }) {
  useEffect(() => {
    if (!t) return;
    title = t;
    emit();
    return () => {
      if (title === t) {
        title = null;
        emit();
      }
    };
  }, [t]);
  return null;
}
