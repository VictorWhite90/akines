"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CloseCircle, MagicStar, More, Notification } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { ME } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { MOBILE_TABS, NAV_GROUPS, isActive } from "./nav";

const PILLARS = [
  { label: "Discover", href: "https://artelia.art", external: true, hint: "Marketplace" },
  { label: "Connect", href: "/", external: false, hint: "Community" },
  { label: "Create", href: "/studio", external: false, hint: "Collaboration" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Artelia Connect home">
      <span className="font-playfair text-xl font-bold text-green-950">Artelia</span>
      <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-green-950">Connect</span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Artelia Connect" className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-grey-700">{group.label}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map(({ href, label, Icon, note }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[4px] px-3 py-2 text-sm transition-colors",
                      active ? "bg-green-950 font-semibold text-white" : "text-green-950 hover:bg-sand-100",
                    )}
                  >
                    <Icon size={18} variant={active ? "Bold" : "Linear"} color="currentColor" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {note && <span className={cn("text-[10px]", active ? "text-white/70" : "text-grey-600")}>{note}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pillar = pathname.startsWith("/studio") || pathname.startsWith("/opportunities") || pathname.startsWith("/applications") || pathname.startsWith("/curator") ? "Create" : "Connect";

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const tabs = NAV_GROUPS.flatMap((g) => g.items).filter((item) => MOBILE_TABS.includes(item.href));

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur" style={{ height: "var(--topbar-height)" }}>
        <div className="flex h-full items-center gap-4 px-4 lg:px-6">
          <Wordmark />
          <nav aria-label="Artelia pillars" className="ml-4 hidden items-center gap-1 md:flex">
            {PILLARS.map((p) => {
              const active = !p.external && p.label === pillar;
              const cls = cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                active ? "bg-sand-100 font-semibold text-green-950" : "text-grey-700 hover:text-green-950",
              );
              return p.external ? (
                <a key={p.label} href={p.href} className={cls} title={p.hint}>
                  {p.label} <span aria-hidden className="text-xs">↗</span>
                </a>
              ) : (
                <Link key={p.label} href={p.href} className={cls} title={p.hint} aria-current={active ? "true" : undefined}>
                  {p.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/companion"
              className="inline-flex items-center gap-2 rounded-full bg-ai-bg px-3 py-2 text-sm font-semibold text-ai transition-colors hover:bg-ai/10"
            >
              <MagicStar size={16} variant="Bold" color="currentColor" aria-hidden />
              <span className="hidden sm:inline">Creative Companion</span>
            </Link>
            <button type="button" aria-label="Notifications (2 new)" className="relative hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-green-950 hover:bg-sand-100 sm:inline-flex">
              <Notification size={20} color="currentColor" aria-hidden />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ruby-500" aria-hidden />
            </button>
            <Link href={`/people/${ME.id}`} aria-label="Your profile">
              <Avatar name={ME.name} size="sm" verified={ME.verified} />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky hidden w-64 shrink-0 overflow-y-auto border-r border-sand-200 bg-white px-3 py-6 lg:block" style={{ top: "var(--topbar-height)", height: "calc(100vh - var(--topbar-height))" }}>
          <NavLinks pathname={pathname} />
        </aside>

        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white lg:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-[10px]", active ? "font-semibold text-green-950" : "text-grey-700")}>
                  <Icon size={20} variant={active ? "Bold" : "Linear"} color="currentColor" aria-hidden />
                  {label.replace("Presence ", "").replace("Collaboration ", "")}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="mobile-menu" className="flex w-full cursor-pointer flex-col items-center gap-1 py-2 text-[10px] text-grey-700">
              <More size={20} color="currentColor" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="All sections" id="mobile-menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 cursor-default bg-green-950/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-3 pb-8 pt-4">
            <div className="mb-4 flex items-center justify-between px-3">
              <Wordmark />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="cursor-pointer text-green-950">
                <CloseCircle size={26} color="currentColor" aria-hidden />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
