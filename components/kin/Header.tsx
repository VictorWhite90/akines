"use client";

import Link from "next/link";
import { refreshHome } from "@/lib/homeRefresh";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bell, BriefcaseBusiness, Camera, Check, ChevronDown, ChevronRight, ChevronUp, Compass, Fingerprint, Heart, CircleHelp, House, Image as ImageIcon, Link2, LogOut, Mail, MapPin, MessageSquare, Palette, PenLine, SlidersHorizontal, Sparkles, User, UserCheck, Users } from "lucide-react";
import { chat } from "@/lib/api/chat";
import { notifications as noticesApi, type Notice } from "@/lib/api/notifications";
import { DEMO } from "@/lib/demo/mode";
import { signOut } from "@/lib/session";
import { SOON, soon } from "@/lib/soon";
import { usePortfolio } from "@/lib/portfolio";
import { completeness, useWorkProfile } from "@/lib/workprofile";
import { useMe } from "@/components/shell/MemberContext";
import { PAGE_TITLES, SECTIONS, sectionOf, type Section, type SectionKey } from "@/components/shell/nav";
import Avatar from "./Avatar";
import { IconButton } from "./Button";
import Logo from "./Logo";
import { Modal } from "./Overlay";
import { MobileTopBar } from "./MobileTopBar";
import type { MobileRoute } from "./mobileRoutes";
import { useLayout } from "./useLayout";
import { useSwipeDown } from "./useSwipeDown";
import "./header.css";
import "./community.css";
import type { ImageInput } from "@/lib/images";

/*
 * The app header, mirrored from the product design (classes in header.css, sheets in akines/library.css):
 * desktop (1280 and up) shows the logo, the actions and the open section's tabs, with the six sections in a bar on the left
 * (SideNav, placed by Shell); tablet shows the page title;
 * phones show the title on top (or, on sub-pages, the top bar with a back button), the sections in a bottom bar (hidden on chat
 * threads), and a sheet for a section's pages. What a phone shows on each page comes from `mobile` (components/kin/mobileRoutes.ts).
 */

export { useLayout } from "./useLayout";

/** Two overlapping circles: Collaborate. */
function Pair({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"><circle cx="9" cy="12" r="5.5" /><circle cx="15" cy="12" r="5.5" /></svg>;
}
const SECTION_ICON: Record<SectionKey, (p: { size?: number }) => React.ReactNode> = {
  home: ({ size = 24 }) => <House size={size} strokeWidth={1.5} aria-hidden />,
  connect: ({ size = 24 }) => <Users size={size} strokeWidth={1.5} aria-hidden />,
  collaborate: Pair,
  make: ({ size = 24 }) => <Palette size={size} strokeWidth={1.5} aria-hidden />,
  explore: ({ size = 24 }) => <Compass size={size} strokeWidth={1.5} aria-hidden />,
  care: ({ size = 24 }) => <Heart size={size} strokeWidth={1.5} aria-hidden />,
};
const count = (n: number) => (n > 99 ? "99+" : String(n));
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "A";
}

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, ref: React.RefObject<HTMLElement | null>, close: () => void) {
  const fn = useRef(close);
  useEffect(() => { fn.current = close; }, [close]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) fn.current(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") fn.current(); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, ref]);
}

const POLL_MS = 60_000;
function useUnread() {
  const [n, setN] = useState({ messages: 0, notices: 0 });
  const refresh = useCallback(async () => {
    // Preview shows the design's counters (3 messages, 12 notifications).
    if (DEMO) { setN({ messages: 3, notices: 12 }); return; }
    const [m, x] = await Promise.all([chat.unread(), noticesApi.unread()]);
    setN({ messages: m.ok ? m.data.unread : 0, notices: x.ok ? x.data.unread : 0 });
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first count, then poll
    void refresh();
    const t = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    const show = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", show);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", show); };
  }, [refresh]);
  return { ...n, refresh };
}

/* ---- Profile progress (pp) ---- */
const PART_TEXT: Record<string, { text: string; Icon: typeof Sparkles }> = {
  work: { text: "Say what you do in a few lines", Icon: PenLine },
  skills: { text: "Choose at least three skills", Icon: Sparkles },
  projects: { text: "Show what you are working on", Icon: Camera },
  cv: { text: "Add your CV or a link to your work", Icon: Link2 },
  availability: { text: "Say what you are open to", Icon: BriefcaseBusiness },
};
/** The product design's sample steps (its features/profile/progress.ts), shown in preview: four left, four done. */
type Part = { id: string; label: string; done: boolean; text?: string; Icon?: typeof Sparkles };
const DESIGN_PARTS: Part[] = [
  { id: "make", label: "Tell us what you make", text: "Choose your crafts and interests", Icon: Sparkles, done: false },
  { id: "intro", label: "Write a short intro", text: "Say who you are in a few lines", Icon: PenLine, done: false },
  { id: "dna", label: "Take the Creative DNA check-in", text: "So we can match you with care", Icon: Fingerprint, done: false },
  { id: "sample", label: "Add a work sample", text: "Show what you are working on", Icon: ImageIcon, done: false },
  { id: "photo", label: "Add a profile photo", text: "Help people recognise you", Icon: Camera, done: true },
  { id: "location", label: "Add your location", text: "Find people and rooms near you", Icon: MapPin, done: true },
  { id: "email", label: "Verify your email", text: "Build trust with other members", Icon: Mail, done: true },
  { id: "connect", label: "Set how you like to connect", text: "Choose your intentions", Icon: Users, done: true },
];
const designProgress = () => ({ parts: DESIGN_PARTS, pct: Math.round((DESIGN_PARTS.filter((p) => p.done).length / DESIGN_PARTS.length) * 100) });

function Ring({ percent }: { percent: number }) {
  const r = 15, c = 2 * Math.PI * r;
  return (
    <span className="pp-ring" aria-hidden>
      <svg viewBox="0 0 36 36" width="36" height="36">
        <circle className="pp-ring__track" cx="18" cy="18" r={r} />
        <circle className="pp-ring__bar" cx="18" cy="18" r={r} style={{ strokeDasharray: c, strokeDashoffset: c * (1 - percent / 100) }} transform="rotate(-90 18 18)" />
      </svg>
      <span className="pp-ring__n">{percent}%</span>
    </span>
  );
}
function ProfileProgress({ compact = false }: { compact?: boolean }) {
  const w = useWorkProfile();
  const pf = usePortfolio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useDismiss(open, ref, () => setOpen(false));
  if (!w.ready) return null;
  const { parts, pct }: { parts: Part[]; pct: number } = DEMO ? designProgress() : completeness(w.wp, pf.pieces.length);
  if (pct >= 100) return null;
  const todo = parts.filter((p) => !p.done), done = parts.filter((p) => p.done);
  return (
    <div className="pp" ref={ref} data-open={open ? "true" : "false"} data-compact={compact ? "true" : "false"}>
      <button type="button" className="pp-pill" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`Complete profile, ${pct}% done`} onClick={() => setOpen((o) => !o)}>
        <Ring percent={pct} />
        <span className="pp-pill__label">Complete profile</span>
        <ChevronUp size={16} strokeWidth={1.5} className="pp-pill__chev" aria-hidden />
      </button>
      {open && (
        <div className="pp-panel" id={id} role="dialog" aria-label="Profile progress">
          <div className="pp-panel__head">
            <h2 className="pp-panel__title">Finish your profile</h2>
            <p className="pp-panel__text">{todo.length === 1 ? "1 step left. A fuller profile means better matches." : `${todo.length} steps left. A fuller profile means better matches.`}</p>
          </div>
          <p className="pp-label">Left to do</p>
          <ul className="pp-list">
            {todo.map((p) => {
              const t = p.text && p.Icon ? { text: p.text, Icon: p.Icon } : PART_TEXT[p.id] ?? { text: "", Icon: Sparkles };
              return (
                <li key={p.id}>
                  <Link href={soon(SOON.completeProfile, p.label)} className="pp-row" onClick={() => setOpen(false)}>
                    <span className="pp-ico"><t.Icon size={20} strokeWidth={1.5} /></span>
                    <span className="pp-txt"><span className="pp-t">{p.label}</span><span className="pp-s">{t.text}</span></span>
                    <ChevronRight size={16} strokeWidth={1.5} className="pp-go" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
          {done.length > 0 && (
            <>
              <p className="pp-label pp-label--done">Completed</p>
              <ul className="pp-list pp-list--done">
                {done.map((p) => (
                  <li key={p.id} className="pp-row pp-row--done">
                    <span className="pp-ico pp-ico--done"><Check size={18} strokeWidth={1.75} /></span>
                    <span className="pp-txt"><span className="pp-t">{p.label}</span></span>
                    <span className="pp-note">Completed</span>
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

/* ---- Account menu ---- */
const ACCOUNT = [
  { label: "View profile", href: "/profile", Icon: User },
  { label: "Complete your profile", href: "/profile/complete", Icon: UserCheck },
  { label: "Settings", href: "/settings", Icon: SlidersHorizontal },
  { label: "Help", href: "/help", Icon: CircleHelp },
];
function AvatarCircle({ name, photo, lg }: { name: string; photo?: ImageInput; lg?: boolean }) {
  return (
    <span className={`hdr-avatar__circle${lg ? " hdr-avatar__circle--lg" : ""}`}>
      {photo ? <Avatar person={{ name, photo }} size={lg ? 44 : 36} /> : initials(name)}
    </span>
  );
}
function AccountMenu({ name, handle, photo, onLogout }: { name: string; handle: string; photo?: ImageInput; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, ref, () => setOpen(false));
  return (
    <div className="hdr-avatar" ref={ref} data-open={open ? "true" : "false"}>
      <button type="button" className="hdr-avatar__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <AvatarCircle name={name} photo={photo} />
        <span className="hdr-avatar__name">{handle}</span>
        <ChevronDown size={16} strokeWidth={1.5} className="hdr-avatar__chev" aria-hidden />
      </button>
      {open && (
        <div className="hdr-menu" role="menu">
          {ACCOUNT.map((a) => <Link key={a.label} href={a.href} role="menuitem" className="hdr-menu__item" onClick={() => setOpen(false)}>{a.label}</Link>)}
          <div className="hdr-menu__rule" role="separator" />
          <button type="button" role="menuitem" className="hdr-menu__item" onClick={() => { setOpen(false); onLogout(); }}>Log out</button>
        </div>
      )}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return n <= 0 ? null : <span className="hdr-count" aria-hidden>{count(n)}</span>;
}

/* ---- Notifications panel (the design opens a modal from the bell) ---- */
function when(iso: string) {
  const d = new Date(iso), mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 10) return "A few minutes ago";
  if (mins < 60) return `${mins} minutes ago`;
  if (mins < 24 * 60) return "Today";
  if (mins < 48 * 60) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}
/**
 * Where a notification opens. Circle notifications go to KinCircle, which is not built yet (its Coming soon page): the circle
 * pages of the old app (/circles/...) do not exist here, and a circle invite may come without a link.
 */
function noticeHref(n: Notice): string | null {
  if (n.link.startsWith("/circles/")) return SOON.kincircle;
  if (n.link) return n.link;
  return n.target_type === "circle" || n.kind.startsWith("circle_") || n.kind === "community_invite" ? SOON.kincircle : null;
}

function NotificationsPanel({ open, onClose, onRead }: { open: boolean; onClose: () => void; onRead: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<Notice[] | null>(null);
  useEffect(() => {
    if (!open) return;
    let live = true;
    void noticesApi.list().then((r) => { if (live) setItems(r.ok ? r.data : []); });
    void noticesApi.markRead().then(() => onRead());
    return () => { live = false; };
  }, [open, onRead]);
  const go = (href: string) => { onClose(); router.push(href); };
  return (
    <Modal open={open} onClose={onClose} title="Notifications" hideClose flush width={400} className="ch-notif" sheet="list">
      <div className="ch-notif__list">
        {items === null ? <p className="ch-row__desc" style={{ padding: "16px 24px" }}>Loading…</p> : items.length === 0 ? <p className="ch-row__desc" style={{ padding: "16px 24px" }}>Nothing new. Notifications appear here.</p> : items.slice(0, 8).map((n) => (
          <button key={n.id} type="button" className="ch-row" onClick={() => { const href = noticeHref(n); if (href) go(href); else onClose(); }}>
            {n.actor ? <Avatar person={{ name: [n.actor.first_name, n.actor.last_name].filter(Boolean).join(" ") || n.actor.username || "Member", photo: n.actor.profile_photo }} size={44} /> : null}
            <span className="ch-row__text"><span className="ch-row__title">{n.text}</span><span className="ch-row__desc">{when(n.created_at)}</span></span>
            <span className="ch-row__chev"><ChevronRight size={16} strokeWidth={1.5} aria-hidden /></span>
          </button>
        ))}
      </div>
      <button type="button" className="ch-tlink ch-notif__pref" onClick={() => go("/settings")}>Notification preferences</button>
    </Modal>
  );
}

export default function Header({ mobile }: { mobile?: MobileRoute }) {
  const pathname = usePathname();
  const router = useRouter();
  const layout = useLayout();
  const { me } = useMe();
  const unread = useUnread();
  const { section, tab } = sectionOf(pathname);
  const [sheet, setSheet] = useState<SectionKey | null>(null);
  const [profileSheet, setProfileSheet] = useState(false);
  const [notices, setNotices] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setSheet(null); setProfileSheet(false); }

  const name = me?.name ?? "You";
  const handle = me?.username ?? me?.firstName ?? "";
  const tabs = section?.tabs.length && section.tabs.length > 1 ? section.tabs : [];
  const activeTab = tab?.label ?? tabs[0]?.label;
  const title = section ? (section.key === "home" ? { eyebrow: "", title: section.label } : { eyebrow: section.label, title: activeTab ?? section.label }) : { eyebrow: "", title: PAGE_TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Akines" };
  const logout = () => void signOut().then(() => router.replace("/landing"));
  const resetDemo = () => void import("@/lib/demo/backend").then((d) => { d.resetDemo(); window.location.assign("/login"); });
  const onRead = useCallback(() => void unread.refresh(), [unread]);
  const phone = layout === "mobile";
  const topBar = phone && mobile?.bar === "top";
  const bottomBar = layout === "tablet" || (phone && mobile?.bottomBar !== false);

  useEffect(() => {
    if (!section) return;
    document.documentElement.dataset.page = section.key === "home" ? "community" : section.key;
    return () => { delete document.documentElement.dataset.page; };
  }, [section]);

  const actions = (compact: boolean) => (
    <>
      <ProfileProgress compact={compact} />
      <IconButton className="hdr-iconbtn" label={unread.messages > 0 ? `Messages, ${unread.messages} unread` : "Messages"} href="/messages"><MessageSquare size={24} strokeWidth={1.5} aria-hidden /><Count n={unread.messages} /></IconButton>
      <IconButton className="hdr-iconbtn" label={unread.notices > 0 ? `Notifications, ${unread.notices} unread` : "Notifications"} onClick={() => setNotices(true)}><Bell size={24} strokeWidth={1.5} aria-hidden /><Count n={unread.notices} /></IconButton>
      <span className="hdr__divider" aria-hidden />
      <AccountMenu name={name} handle={handle} photo={me?.photo} onLogout={logout} />
    </>
  );

  return (
    <>
      {DEMO && (
        <div className="ak-demo" role="status">
          <span><b>Demo</b><span className="long"> · sample data in your browser</span></span>
          <Link href="/pages">All pages</Link>
          <button type="button" onClick={resetDemo}>Reset</button>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      )}
      {layout === "desktop" && (
        <header className="hdr" data-layout="desktop">
          <div className="hdr__row">
            <div className="hdr__left">
              <Link href="/" className="hdr__logo" aria-label="Akines, Community Home" onClick={refreshHome}><Logo /></Link>
            </div>
            <div className="hdr__actions">{actions(false)}</div>
          </div>
          {tabs.length > 0 && (
            <nav className="hdr-tabs" aria-label={section?.label}>
              {tabs.map((t) => <Link key={t.href} href={t.href} className="hdr-tab" aria-current={t.label === activeTab ? "page" : undefined} data-active={t.label === activeTab ? "true" : "false"}>{t.label}</Link>)}
            </nav>
          )}
        </header>
      )}
      {layout === "tablet" && (
        <header className="hdr hdr--tablet" data-layout="tablet">
          <div className="hdr__row">
            <div className="hdr__left">
              <Link href="/" className="hdr__logo" aria-label="Akines, Community Home" onClick={refreshHome}><Logo /></Link>
              <span className="hdr__divider hdr__divider--tall" aria-hidden />
              <div className="hdr__title">{title.eyebrow ? <span className="hdr__eyebrow">{title.eyebrow}</span> : null}<span className="hdr__h">{title.title}</span></div>
            </div>
            <div className="hdr__actions">{actions(true)}</div>
          </div>
        </header>
      )}
      {topBar && <MobileTopBar title={mobile?.title ?? title.title} back={mobile?.back} />}
      {phone && !topBar && (
        // Figma "Header Mobile": no profile progress here; the profile sheet carries "Complete your profile"
        <header className="hdr hdr--mobile" data-layout="mobile">
          <div className="hdr__row">
            <div className="hdr__left">
              <Link href="/" className="hdr__logo" aria-label="Akines, Community Home" onClick={refreshHome}><Logo word={false} /></Link>
              <div className="hdr__title">{title.eyebrow ? <span className="hdr__eyebrow">{title.eyebrow}</span> : null}<span className="hdr__h">{title.title}</span></div>
            </div>
            <div className="hdr__actions">
              <button type="button" className="hdr-avatar__btn hdr-avatar__btn--solo" aria-label="Profile, messages and notifications" aria-haspopup="dialog" aria-expanded={profileSheet} data-open={profileSheet ? "true" : undefined} onClick={() => setProfileSheet(true)}>
                <AvatarCircle name={name} photo={me?.photo} />
                {unread.messages + unread.notices > 0 ? <span className="hdr-dot" aria-hidden /> : null}
              </button>
            </div>
          </div>
        </header>
      )}

      {bottomBar && (
        <nav className="bbar" aria-label="Main">
          <div className="bbar__items">
            {SECTIONS.map((s) => {
              const on = section?.key === s.key;
              const Icon = SECTION_ICON[s.key];
              return (
                <button key={s.key} type="button" className="bbar__item" aria-label={s.label} aria-current={on ? "page" : undefined} data-active={on ? "true" : "false"} onClick={() => { if (s.tabs.length > 1) return setSheet(s.key); if (s.key === "home") refreshHome(); router.push(s.href); }}>
                  <span className="bbar__press" aria-hidden />
                  <span className="bbar__ind" aria-hidden />
                  <Icon />
                </button>
              );
            })}
          </div>
        </nav>
      )}
      {layout !== "desktop" && <SectionSheet sectionKey={sheet} active={section?.key === sheet ? activeTab : undefined} onClose={() => setSheet(null)} />}
      {phone && (
        <ProfileSheet open={profileSheet} onClose={() => setProfileSheet(false)} name={name} handle={handle} photo={me?.photo} messages={unread.messages} notices={unread.notices} onNotifications={() => { setProfileSheet(false); setNotices(true); }} onLogout={logout} />
      )}
      <NotificationsPanel open={notices} onClose={() => setNotices(false)} onRead={onRead} />
    </>
  );
}

/**
 * Desktop (1280 and up): the six sections as a vertical icon bar on the left, under the header (Shell places it beside the
 * page). Each icon shows its name on hover or keyboard focus; the open section has the orange bar at its left edge.
 */
export function SideNav() {
  const pathname = usePathname();
  const { section } = sectionOf(pathname);
  return (
    <nav className="snav" aria-label="Main">
      <ul className="snav__list">
        {SECTIONS.map((s) => {
          const on = section?.key === s.key;
          const Icon = SECTION_ICON[s.key];
          return (
            <li key={s.key}>
              <Link href={s.href} className="snav__item" onClick={s.key === "home" ? refreshHome : undefined} aria-label={s.label} aria-current={on ? "page" : undefined} data-active={on ? "true" : "false"}>
                <span className="snav__ind" aria-hidden />
                <Icon />
                <span className="snav__tip" role="presentation">{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Focus into a sheet while open, Escape closes, focus returns. */
function useSheet(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); html.style.overflow = prev; before?.focus?.(); };
  }, [open]);
  return ref;
}

/** Handle at the top of a sheet: tap to close, or drag the sheet down (phones). */
function Handle({ open, onClose }: { open: boolean; onClose: () => void }) {
  const swipe = useSwipeDown(onClose, open);
  return <button type="button" className="sheet__handle" aria-label="Close" {...swipe}><span /></button>;
}

/** A section's tabs on tablets and phones. Each row opens its tab, as the header tabs do (Banter is its Coming soon page). */
function SectionSheet({ sectionKey, active, onClose }: { sectionKey: SectionKey | null; active?: string; onClose: () => void }) {
  const ref = useSheet(sectionKey !== null, onClose);
  const [shown, setShown] = useState<Section | null>(null);
  const s = SECTIONS.find((x) => x.key === sectionKey) ?? null;
  if (s && s !== shown) setShown(s);
  const sec = s ?? shown;
  const Icon = sec ? SECTION_ICON[sec.key] : null;
  return (
    <div className="sheet-layer" data-open={sectionKey ? "true" : "false"} aria-hidden={sectionKey ? undefined : true}>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      {sec && Icon && (
        <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label={sec.label} tabIndex={-1}>
          <Handle open={sectionKey !== null} onClose={onClose} />
          <div className="sheet__title"><Icon /><span>{sec.label}</span></div>
          <ul className="sheet__rows">
            {sec.tabs.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="sheet-row" data-selected={t.label === active ? "true" : "false"} onClick={onClose}>
                  <span className="sheet-row__label">{t.label}</span>
                  {t.label === active ? <span className="sheet-row__dot" aria-hidden /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProfileSheet({ open, onClose, name, handle, photo, messages, notices, onNotifications, onLogout }: { open: boolean; onClose: () => void; name: string; handle: string; photo?: ImageInput; messages: number; notices: number; onNotifications: () => void; onLogout: () => void }) {
  const ref = useSheet(open, onClose);
  const row = (Icon: typeof User, label: string, href: string, n?: number) => (
    <Link href={href} className="sheet-row" data-selected="false" onClick={onClose}>
      <Icon size={24} strokeWidth={1.5} aria-hidden />
      <span className="sheet-row__label">{label}</span>
      {n ? <span className="sheet-row__count">{count(n)}</span> : null}
    </Link>
  );
  return (
    <div className="sheet-layer" data-open={open ? "true" : "false"} aria-hidden={open ? undefined : true}>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label="Profile" tabIndex={-1} hidden={!open}>
        <Handle open={open} onClose={onClose} />
        <div className="sheet__profile"><AvatarCircle name={name} photo={photo} lg /><span className="sheet__username">{handle || name}</span></div>
        <ul className="sheet__rows">
          <li>{row(MessageSquare, "Messages", "/messages", messages)}</li>
          <li>
            <button type="button" className="sheet-row" data-selected="false" onClick={onNotifications}>
              <Bell size={24} strokeWidth={1.5} aria-hidden />
              <span className="sheet-row__label">Notifications</span>
              <span className="sheet-row__count">{count(notices)}</span>
            </button>
          </li>
        </ul>
        <div className="sheet__rule" />
        <ul className="sheet__rows">
          {ACCOUNT.map((a) => <li key={a.label}>{row(a.Icon, a.label, a.href)}</li>)}
        </ul>
        <div className="sheet__rule" />
        <ul className="sheet__rows">
          <li>
            <button type="button" className="sheet-row" data-selected="false" onClick={() => { onClose(); onLogout(); }}>
              <LogOut size={24} strokeWidth={1.5} aria-hidden />
              <span className="sheet-row__label">Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
