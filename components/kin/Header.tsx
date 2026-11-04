"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, BriefcaseBusiness, Check, ChevronDown, ChevronRight, ChevronUp, Compass, Heart, House, Info, LogOut, MessageSquare, Monitor, Moon, Palette, Settings, Sun, User, Users, X } from "lucide-react";
import { chat } from "@/lib/api/chat";
import { notifications } from "@/lib/api/notifications";
import { DEMO } from "@/lib/demo/mode";
import { signOut } from "@/lib/session";
import { usePortfolio } from "@/lib/portfolio";
import { completeness, useWorkProfile } from "@/lib/workprofile";
import { useMe } from "@/components/shell/MemberContext";
import { PAGE_TITLES, SECTIONS, sectionOf, type Section, type SectionKey } from "@/components/shell/nav";
import "./header.css";

/** Two overlapping circles: Collaborate. */
function Pair({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </svg>
  );
}

const ICON: Record<SectionKey, (p: { size?: number }) => React.ReactNode> = {
  home: ({ size = 24 }) => <House size={size} strokeWidth={1.5} aria-hidden />,
  connect: ({ size = 24 }) => <Users size={size} strokeWidth={1.5} aria-hidden />,
  collaborate: Pair,
  make: ({ size = 24 }) => <Palette size={size} strokeWidth={1.5} aria-hidden />,
  explore: ({ size = 24 }) => <Compass size={size} strokeWidth={1.5} aria-hidden />,
  care: ({ size = 24 }) => <Heart size={size} strokeWidth={1.5} aria-hidden />,
};

type Mode = "light" | "dark" | "system";
const THEME_KEY = "ak:theme";
const NEXT_MODE: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };
const MODE_LABEL: Record<Mode, string> = { light: "Light", dark: "Dark", system: "Match device" };
function applyTheme(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "A";
}

const POLL_MS = 60_000;

/** Unread messages and notifications, checked on mount, every minute and when the tab comes back. */
function useUnread() {
  const [counts, setCounts] = useState({ messages: 0, notices: 0 });
  const refresh = useCallback(async () => {
    const [m, n] = await Promise.all([chat.unread(), notifications.unread()]);
    setCounts({ messages: m.ok ? m.data.unread : 0, notices: n.ok ? n.data.unread : 0 });
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first count, then poll
    void refresh();
    const timer = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    const onShow = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onShow);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onShow); };
  }, [refresh]);
  return counts;
}

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, close, ref]);
}

function Ring({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 15;
  return (
    <span className="ak-ring" aria-hidden>
      <svg viewBox="0 0 36 36" width="36" height="36">
        <circle className="track" cx="18" cy="18" r="15" />
        <circle className="bar" cx="18" cy="18" r="15" transform="rotate(-90 18 18)" style={{ strokeDasharray: c, strokeDashoffset: c * (1 - pct / 100) }} />
      </svg>
      <span className="n">{pct}%</span>
    </span>
  );
}

/** "Complete profile": a ring with the share done, and a panel of what is left. Hidden once it is complete. */
function ProfileProgress({ compact = false }: { compact?: boolean }) {
  const w = useWorkProfile();
  const pf = usePortfolio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  if (!w.ready) return null;
  const { parts, pct } = completeness(w.wp, pf.pieces.length);
  if (pct >= 100) return null;
  const left = parts.filter((p) => !p.done);
  const done = parts.filter((p) => p.done);
  return (
    <div className="ak-pp" ref={ref} data-open={open} data-compact={compact}>
      <button type="button" className="ak-pp-pill" aria-haspopup="dialog" aria-expanded={open} aria-label={`Complete profile, ${pct}% done`} onClick={() => setOpen((o) => !o)}>
        <Ring pct={pct} />
        <span className="lbl">Complete profile</span>
        <ChevronUp size={16} strokeWidth={1.5} className="chev" aria-hidden />
      </button>
      {open && (
        <div className="ak-pp-panel" role="dialog" aria-label="Complete your profile">
          <div className="head">
            <p className="title">Complete your profile</p>
            <p className="text">{left.length} {left.length === 1 ? "step" : "steps"} left. A fuller profile means better matches.</p>
          </div>
          <p className="label">Left to do</p>
          <ul>
            {left.map((p) => (
              <li key={p.id}>
                <Link href="/profile/work" className="row" onClick={close}>
                  <span className="ico"><BriefcaseBusiness size={20} strokeWidth={1.5} aria-hidden /></span>
                  <span className="txt"><span className="t">{p.label}</span></span>
                  <ChevronRight size={18} strokeWidth={1.5} className="go" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          {done.length > 0 && (
            <>
              <p className="label">Completed</p>
              <ul>
                {done.map((p) => (
                  <li key={p.id} className="row done">
                    <span className="ico done"><Check size={16} strokeWidth={2} aria-hidden /></span>
                    <span className="txt"><span className="t">{p.label}</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function useTheme() {
  const [mode, setMode] = useState<Mode>("light");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved choice once on mount
    try { setMode((localStorage.getItem(THEME_KEY) as Mode) || "light"); } catch {}
  }, []);
  const cycle = () => {
    const next = NEXT_MODE[mode];
    setMode(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    applyTheme(next);
  };
  return { mode, cycle };
}

/**
 * The app header, shared by both layouts (it brings its own stylesheet). Desktop: the six sections as icons,
 * the open section's pages as tabs beneath, profile progress, messages, notifications and the account menu.
 * Phones: the page title on top and the six sections in a bar at the bottom; a section with several pages
 * opens them in a sheet.
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { me } = useMe();
  const unread = useUnread();
  const { mode, cycle } = useTheme();
  const { section, tab } = sectionOf(pathname);
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<Section | null>(null);
  const [account, setAccount] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenu(false), []);
  useDismiss(menu, closeMenu, menuRef);
  // A new page closes whatever was open (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(false);
    setSheet(null);
    setAccount(false);
  }

  const name = me?.name ?? "You";
  const handle = me?.username ?? me?.firstName ?? "";
  const title = tab?.label && section && section.tabs.length > 1 ? tab.label : section?.label ?? PAGE_TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Akines";
  const ModeIcon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;
  const out = () => void signOut().then(() => router.replace("/about"));
  const resetDemo = () => void import("@/lib/demo/backend").then((d) => { d.resetDemo(); window.location.assign("/login"); });

  const accountLinks = [
    { href: "/profile", label: "View profile", Icon: User },
    { href: "/profile/work", label: "Your work profile", Icon: BriefcaseBusiness },
    { href: "/settings", label: "Settings", Icon: Settings },
    { href: "/about", label: "About Akines", Icon: Info },
  ];

  return (
    <>
      {DEMO && (
        <div className="ak-demo" role="status">
          <span><b>Demo</b><span className="long"> · sample data in your browser</span></span>
          <Link href="/pages">All pages</Link>
          <button type="button" onClick={resetDemo}>Reset</button>
          <button type="button" onClick={out}>Sign out</button>
        </div>
      )}
      <header className="ak-hdr">
        <div className="ak-hdr__row">
          <div className="ak-hdr__left">
            <Link href="/" className="ak-logo" aria-label="Akines, Community Home">
              {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
              <img src="/akines/mark.svg" alt="" width={31} height={32} />
              <span className="word">AKINES</span>
            </Link>
            <span className="ak-hdr__title" aria-hidden>{title}</span>
            <nav className="ak-hdr-nav" aria-label="Main">
              {SECTIONS.map((s) => {
                const Icon = ICON[s.key];
                const on = section?.key === s.key;
                return (
                  <Link key={s.key} href={s.href} className="item" aria-label={s.label} aria-current={on ? "page" : undefined} data-active={on}>
                    <Icon />
                    <span className="bar" aria-hidden />
                    <span className="tip" role="presentation">{s.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="ak-hdr__actions">
            <span className="ak-hdr__wide"><ProfileProgress /></span>
            <span className="ak-hdr__mid"><ProfileProgress compact /></span>
            <Link href="/messages" className="ak-ibtn ak-hdr__desk" aria-label={unread.messages ? `Messages, ${unread.messages} unread` : "Messages"} aria-current={pathname.startsWith("/messages") ? "page" : undefined}>
              <MessageSquare size={24} strokeWidth={1.5} aria-hidden />
              {unread.messages > 0 && <span className="count" aria-hidden>{unread.messages > 99 ? "99+" : unread.messages}</span>}
              <span className="tip" role="presentation">{unread.messages ? `Messages, ${unread.messages} unread` : "Messages"}</span>
            </Link>
            <Link href="/notifications" className="ak-ibtn ak-hdr__desk" aria-label={unread.notices ? `Notifications, ${unread.notices} unread` : "Notifications"} aria-current={pathname.startsWith("/notifications") ? "page" : undefined}>
              <Bell size={24} strokeWidth={1.5} aria-hidden />
              {unread.notices > 0 && <span className="count" aria-hidden>{unread.notices > 99 ? "99+" : unread.notices}</span>}
              <span className="tip" role="presentation">{unread.notices ? `Notifications, ${unread.notices} unread` : "Notifications"}</span>
            </Link>
            <span className="ak-hdr__divider ak-hdr__desk" aria-hidden />
            <div className="ak-acct ak-hdr__desk" ref={menuRef} data-open={menu}>
              <button type="button" className="btn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                <span className="circle">
                  {/* eslint-disable-next-line @next/next/no-img-element -- member photo from any host */}
                  {me?.photo ? <img src={me.photo} alt="" /> : initials(name)}
                </span>
                <span className="name">{handle || name}</span>
                <ChevronDown size={16} strokeWidth={1.5} className="chev" aria-hidden />
                <span className="sr-only">Account menu</span>
              </button>
              {menu && (
                <div className="ak-menu" role="menu">
                  <div className="who"><b>{name}</b>{me?.username && <small>@{me.username}</small>}</div>
                  <span className="rule" />
                  {accountLinks.map(({ href, label, Icon }) => (
                    <Link key={href} href={href} role="menuitem" className="item"><Icon size={18} strokeWidth={1.5} aria-hidden />{label}</Link>
                  ))}
                  <button type="button" role="menuitem" className="item" onClick={cycle}><ModeIcon size={18} strokeWidth={1.5} aria-hidden />Theme: {MODE_LABEL[mode]}</button>
                  <span className="rule" />
                  <button type="button" role="menuitem" className="item" onClick={out}><LogOut size={18} strokeWidth={1.5} aria-hidden />Log out</button>
                </div>
              )}
            </div>
            <button type="button" className="ak-ibtn ak-hdr__phone ak-me" aria-label={`Account${unread.messages + unread.notices ? `, ${unread.messages + unread.notices} unread` : ""}`} aria-haspopup="dialog" onClick={() => setAccount(true)}>
              <span className="circle">
                {/* eslint-disable-next-line @next/next/no-img-element -- member photo from any host */}
                {me?.photo ? <img src={me.photo} alt="" /> : initials(name)}
              </span>
              {unread.messages + unread.notices > 0 && <span className="dot" aria-hidden />}
            </button>
          </div>
        </div>

        {section && section.tabs.length > 1 && (
          <nav className="ak-hdr-tabs" aria-label={section.label}>
            {section.tabs.map((t) => (
              <Link key={t.href} href={t.href} className="tab" data-active={tab?.href === t.href} aria-current={tab?.href === t.href ? "page" : undefined}>{t.label}</Link>
            ))}
          </nav>
        )}
      </header>

      {/* Phones: the six sections. A section with several pages opens them in a sheet. */}
      <nav className="ak-bbar" aria-label="Main">
        <div className="items">
          {SECTIONS.map((s) => {
            const Icon = ICON[s.key];
            const on = section?.key === s.key;
            const many = s.tabs.length > 1;
            return many ? (
              <button key={s.key} type="button" className="item" aria-label={s.label} aria-haspopup="dialog" aria-current={on ? "page" : undefined} data-active={on} onClick={() => setSheet(s)}>
                <span className="press" aria-hidden /><span className="ind" aria-hidden /><Icon />
              </button>
            ) : (
              <Link key={s.key} href={s.href} className="item" aria-label={s.label} aria-current={on ? "page" : undefined} data-active={on}>
                <span className="press" aria-hidden /><span className="ind" aria-hidden /><Icon />
              </Link>
            );
          })}
        </div>
      </nav>

      <PhoneSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.label ?? ""}>
        {sheet?.tabs.map((t) => {
          const on = tab?.href === t.href;
          return (
            <Link key={t.href} href={t.href} className="ak-srow" aria-current={on ? "page" : undefined}>
              <span className="lbl">{t.label}</span>
              {on ? <span className="dot" aria-hidden /> : <ChevronRight size={18} strokeWidth={1.5} aria-hidden />}
            </Link>
          );
        })}
      </PhoneSheet>

      <PhoneSheet open={account} onClose={() => setAccount(false)} title={name} sub={me?.username ? `@${me.username}` : undefined}>
        <ProfileProgress />
        <Link href="/messages" className="ak-srow"><MessageSquare size={20} strokeWidth={1.5} aria-hidden /><span className="lbl">Messages</span>{unread.messages > 0 && <span className="num">{unread.messages}</span>}</Link>
        <Link href="/notifications" className="ak-srow"><Bell size={20} strokeWidth={1.5} aria-hidden /><span className="lbl">Notifications</span>{unread.notices > 0 && <span className="num">{unread.notices}</span>}</Link>
        {accountLinks.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="ak-srow"><Icon size={20} strokeWidth={1.5} aria-hidden /><span className="lbl">{label}</span></Link>
        ))}
        <button type="button" className="ak-srow" onClick={cycle}><ModeIcon size={20} strokeWidth={1.5} aria-hidden /><span className="lbl">Theme: {MODE_LABEL[mode]}</span></button>
        <button type="button" className="ak-srow" onClick={out}><LogOut size={20} strokeWidth={1.5} aria-hidden /><span className="lbl">Log out</span></button>
      </PhoneSheet>
    </>
  );
}

/** A bottom sheet for phones, with its own styles so it works in either layout. */
function PhoneSheet({ open, onClose, title, sub, children }: { open: boolean; onClose: () => void; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="ak-sheet-scrim" />
        <Dialog.Content className="ak-sheet">
          <div className="ak-sheet__head">
            <div>
              <Dialog.Title className="ak-sheet__title">{title}</Dialog.Title>
              {sub ? <Dialog.Description className="ak-sheet__sub">{sub}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="ak-ibtn" aria-label="Close"><X size={22} strokeWidth={1.5} aria-hidden /></Dialog.Close>
          </div>
          <div className="ak-sheet__body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
