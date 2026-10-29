"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Add, ArrowDown2, Game, Heart, InfoCircle, Hierarchy, Home2, Message, Messages2, Notification, People, Profile, SearchNormal1, Setting2, Shop, Key } from "iconsax-reactjs";
import { DEMO } from "@/lib/demo/mode";
import { isSignedIn, signOut } from "@/lib/session";
import { recordRoute } from "@/lib/navHistory";
import { MemberProvider, useMe } from "@/components/shell/MemberContext";
import { isActive } from "@/components/shell/nav";
import Avatar from "./Avatar";
import Button from "./Button";
import Sheet from "./Sheet";
import ThemeToggle from "./ThemeToggle";
import { ViewTransitions } from "./ViewTransitions";
import { spring } from "./motion";

type Item = { href: string; label: string; Icon: typeof Home2 };
/** Everything stays reachable. Routes not yet redesigned open in the legacy shell (a full document load). */
const NAV: Item[] = [
  { href: "/", label: "Home", Icon: Home2 },
  { href: "/banter", label: "Banter", Icon: Messages2 },
  { href: "/circles", label: "KinCircles", Icon: People },
  { href: "/collaborate", label: "Collaborate", Icon: Hierarchy },
  { href: "/messages", label: "Messages", Icon: Message },
  { href: "/play", label: "Play", Icon: Game },
  { href: "/studios", label: "Studios", Icon: Key },
  { href: "/shop", label: "Shop", Icon: Shop },
  { href: "/wellbeing", label: "Wellbeing", Icon: Heart },
  { href: "/notifications", label: "Notifications", Icon: Notification },
  { href: "/profile", label: "Profile", Icon: Profile },
  { href: "/settings", label: "Settings", Icon: Setting2 },
];
const MAIN = NAV.slice(0, 7);
const MORE = [...NAV.slice(7), { href: "/about", label: "About Akines", Icon: InfoCircle }];
const DOCK = NAV.filter((i) => ["/", "/banter", "/collaborate", "/messages", "/profile"].includes(i.href));
const PUBLIC = ["/landing", "/login", "/signup", "/about", "/about/philosophy", "/welcome"];

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
        <Frame>{children}</Frame>
      </ViewTransitions>
    </MemberProvider>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me } = useMe();
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!more) return;
    const down = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMore(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [more]);
  const meAvatar = { name: me?.name ?? "You", photo: me?.photo };
  const on = (href: string) => (href === "/" ? pathname === "/" : isActive(pathname, href));

  return (
    <div className="k-shell">
      {DEMO && (
        <div className="k-demo" role="status">
          <span><b>Demo</b><span className="long"> · sample data in your browser</span></span>
          <Link href="/pages">All pages</Link>
          <button type="button" onClick={() => void import("@/lib/demo/backend").then((d) => { d.resetDemo(); window.location.assign("/login"); })}>Reset</button>
          <button type="button" onClick={() => void signOut().then(() => router.replace("/about"))}>Sign out</button>
        </div>
      )}

      {/* Phones: face (menu), the mark, search, notifications. */}
      <header className="k-top">
        <button type="button" className="k-btn ghost icon" onClick={() => setMenu(true)} aria-label="Open menu" aria-haspopup="dialog"><Avatar person={meAvatar} size={30} /></button>
        <Link href="/" className="mark" aria-label="Akines home">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
          <img src="/akines/mark.svg" alt="" width={28} height={28} />
        </Link>
        <Button variant="ghost" icon href="/kindred" aria-label="Search"><SearchNormal1 size={22} color="currentColor" /></Button>
        <Button variant="ghost" icon href="/notifications" aria-label="Notifications"><Notification size={22} color="currentColor" /></Button>
      </header>

      {/* Desktop: a labelled left navigation. */}
      <aside className="k-side">
        <Link href="/" className="mark" aria-label="Akines home">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
          <img src="/akines/mark.svg" alt="" width={28} height={28} />
          Akines
        </Link>
        <nav aria-label="Main">
          {MAIN.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={on(href) ? "on" : undefined} aria-current={on(href) ? "page" : undefined}>
              <Icon size={24} color="currentColor" />{label}
            </Link>
          ))}
          <div className="k-more" ref={moreRef}>
            <button type="button" aria-expanded={more} aria-haspopup="menu" onClick={() => setMore((m) => !m)}>
              <ArrowDown2 size={24} color="currentColor" style={{ transform: more ? "rotate(180deg)" : undefined, transition: "transform 200ms" }} />More
            </button>
            {more && (
              <div className="k-menu" role="menu">
                {MORE.map(({ href, label, Icon }) => (
                  <Link key={href} href={href} role="menuitem" className={on(href) ? "on" : undefined} onClick={() => setMore(false)}><Icon size={20} color="currentColor" />{label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <Button variant="primary" className="k-side-create" href="/collaborate/new"><Add size={20} color="currentColor" />Create</Button>
        <div className="k-side-foot">
          <Link href="/profile" className="k-side-me">
            <Avatar person={meAvatar} size={36} />
            <span style={{ minWidth: 0 }}><b>{me?.name ?? "You"}</b><small>{me?.username ? `@${me.username}` : ""}</small></span>
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      <main className="k-main" id="main">{children}</main>

      {/* Phones: five places. */}
      <nav className="k-dock" aria-label="Quick navigation">
        {DOCK.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={on(href) ? "on" : undefined} aria-label={label} aria-current={on(href) ? "page" : undefined}>
            {on(href) && <motion.span layoutId="dock-ind" className="k-dock-ind" transition={spring.indicator} />}
            <Icon size={24} color="currentColor" />
          </Link>
        ))}
      </nav>

      <Sheet open={menu} onClose={() => setMenu(false)} title={me?.name ?? "Menu"} sub={me?.username ? `@${me.username}` : undefined} side="left">
        <nav className="k-drawer-nav" aria-label="All places">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={on(href) ? "on" : undefined} onClick={() => setMenu(false)}><Icon size={24} color="currentColor" />{label}</Link>
          ))}
          <Link href="/about" onClick={() => setMenu(false)}><InfoCircle size={24} color="currentColor" />About Akines</Link>
        </nav>
        <div className="k-drawer-foot">
          <ThemeToggle label />
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={() => void signOut().then(() => router.replace("/about"))}>Sign out</Button>
        </div>
      </Sheet>
    </div>
  );
}
