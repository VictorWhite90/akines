"use client";

import Image from "next/image";
import Link from "next/link";
import { Add, Book1, Briefcase, Layer, MagicStar } from "iconsax-reactjs";
import { useState, type ReactNode } from "react";
import { CIRCLES } from "@/lib/data/connect";
import { cn } from "@/lib/cn";
import type { SpaceId } from "./nav";

type Tip = { label: string; y: number } | null;

function RailItem({ href, label, active, children, unread, onTip }: { href: string; label: string; active: boolean; children: ReactNode; unread?: boolean; onTip: (tip: Tip) => void }) {
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    onTip({ label, y: r.top + r.height / 2 });
  };
  return (
    <li className="group relative flex justify-center">
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all",
          active ? "h-9" : unread ? "h-2" : "h-0 group-hover:h-5",
        )}
      />
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        onMouseEnter={(e) => show(e.currentTarget)}
        onMouseLeave={() => onTip(null)}
        onFocus={(e) => show(e.currentTarget)}
        onBlur={() => onTip(null)}
        className={cn(
          "flex h-12 w-12 items-center justify-center overflow-hidden transition-all",
          active ? "rounded-[16px]" : "rounded-[24px] hover:rounded-[16px]",
        )}
      >
        {children}
      </Link>
    </li>
  );
}

const iconTile = (active: boolean) => cn("flex h-full w-full items-center justify-center", active ? "bg-fire text-night-950" : "bg-night-700 text-night-text group-hover:bg-fire group-hover:text-night-950");

export default function SpaceRail({ space }: { space: SpaceId }) {
  const myCircles = CIRCLES.filter((c) => c.isMember);
  const [tip, setTip] = useState<Tip>(null);
  return (
    <>
    <nav aria-label="Spaces" className="scrollbar-hide flex h-full w-[72px] shrink-0 flex-col items-center overflow-y-auto bg-night-950 py-3">
      <ul className="flex w-full flex-col gap-2">
        <RailItem onTip={setTip} href="/" label="Home" active={space === "home"}>
          <span className={cn(iconTile(space === "home"), "font-playfair text-2xl font-bold")}>A</span>
        </RailItem>
        <li aria-hidden className="mx-auto my-1 h-0.5 w-8 rounded-full bg-night-700" />
        {myCircles.map((circle) => (
          <RailItem onTip={setTip} key={circle.id} href={`/c/${circle.id}/general`} label={circle.name} active={space === `circle:${circle.id}`} unread={circle.id === "textiles"}>
            <Image src={circle.image} alt="" width={48} height={48} className="h-full w-full object-cover" />
          </RailItem>
        ))}
        <RailItem onTip={setTip} href="/circles" label="Find a circle" active={false}>
          <span className="flex h-full w-full items-center justify-center bg-night-800 text-presence-around group-hover:bg-presence-around group-hover:text-night-950">
            <Add size={24} color="currentColor" aria-hidden />
          </span>
        </RailItem>
        <li aria-hidden className="mx-auto my-1 h-0.5 w-8 rounded-full bg-night-700" />
        <RailItem onTip={setTip} href="/studio" label="Collaboration Studio" active={space === "studio"}>
          <span className={iconTile(space === "studio")}><Layer size={22} color="currentColor" aria-hidden /></span>
        </RailItem>
        <RailItem onTip={setTip} href="/opportunities" label="Opportunities" active={space === "opportunities"}>
          <span className={iconTile(space === "opportunities")}><Briefcase size={22} color="currentColor" aria-hidden /></span>
        </RailItem>
        <RailItem onTip={setTip} href="/stories" label="Gallery — stories & journals" active={space === "gallery"}>
          <span className={iconTile(space === "gallery")}><Book1 size={22} color="currentColor" aria-hidden /></span>
        </RailItem>
      </ul>
      <ul className="mt-auto flex w-full flex-col gap-2 pt-3">
        <RailItem onTip={setTip} href="/companion" label="Creative Companion (AI)" active={false}>
          <span className="flex h-full w-full items-center justify-center bg-ai text-white"><MagicStar size={22} variant="Bold" color="currentColor" aria-hidden /></span>
        </RailItem>
      </ul>
    </nav>
    {tip && (
      <span
        role="tooltip"
        className="pointer-events-none fixed left-[80px] z-[70] -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-night-950 px-3 py-2 text-sm font-semibold text-white shadow-xl ring-1 ring-night-600"
        style={{ top: tip.y }}
      >
        <span aria-hidden className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-night-950" />
        {tip.label}
      </span>
    )}
    </>
  );
}
