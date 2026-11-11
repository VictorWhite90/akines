/**
 * The app header (components/kin/Header.tsx): six sections as icons, and the pages of the open section
 * as tabs beneath, at the product design's paths (akines-landing src/app-shell/nav-model.ts). Pages the design
 * has not designed yet are Coming soon pages (components/kin/ComingSoon.tsx).
 */
export type SectionKey = "home" | "connect" | "collaborate" | "make" | "explore" | "care";
/** A tab, and other paths that should show it as the current one. */
export type SectionTab = { href: string; label: string; also?: string[] };
export type Section = { key: SectionKey; label: string; href: string; tabs: SectionTab[]; also?: string[] };

export const SECTIONS: Section[] = [
  // The design keeps Messages, Settings, the three care screens and your collaborations inside Community Home.
  { key: "home", label: "Community Home", href: "/", tabs: [], also: ["/messages", "/settings", "/wellbeing/quiet", "/wellbeing/reflect", "/wellbeing/support", "/community/collaborations", "/community/banter"] },
  {
    key: "connect",
    label: "Connect",
    href: "/connect",
    tabs: [
      { href: "/connect", label: "Discover" },
      { href: "/connect/kincircle", label: "KinCircle" },
      { href: "/connect/rooms", label: "Rooms" },
      { href: "/connect/banter", label: "Banter" },
      { href: "/connect/activities", label: "Activities" },
    ],
  },
  {
    key: "collaborate",
    label: "Collaborate",
    href: "/collaborate",
    // The design's Collaborate tabs; a project's page, saved projects and member pages sit under Discover Projects.
    tabs: [
      { href: "/collaborate", label: "Home" },
      { href: "/collaborate/discover", label: "Discover Projects", also: ["/collaborate/projects", "/collaborate/saved", "/collaborate/members"] },
      { href: "/collaborate/my-projects", label: "My Projects", also: ["/collaborate/start", "/collaborate/open-calls"] },
      { href: "/collaborate/collaborators", label: "Collaborators", also: ["/collaborate/introduction-requests", "/collaborate/saved-collaborators"] },
      { href: "/collaborate/opportunities", label: "Opportunities" },
      { href: "/collaborate/contributions", label: "My Contributions" },
    ],
  },
  {
    key: "make",
    label: "Make & Sell",
    href: "/make-sell",
    tabs: [
      { href: "/make-sell", label: "My Studio" },
      { href: "/make-sell/journal", label: "My Journal" },
      { href: "/make-sell/store", label: "My Store" },
    ],
  },
  {
    key: "explore",
    label: "Explore",
    href: "/explore",
    tabs: [
      { href: "/explore", label: "Shop Art" },
      { href: "/explore/studio-visits", label: "Studio Visits" },
      { href: "/explore/stories", label: "Stories and Legacy" },
    ],
  },
  {
    key: "care",
    label: "Care",
    href: "/care",
    tabs: [
      { href: "/care", label: "Creative Wellbeing" },
      { href: "/care/creative-dna", label: "Creative DNA" },
    ],
  },
];

const under = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** The section a path belongs to, and the tab within it (the longest matching tab wins). */
export function sectionOf(pathname: string): { section: Section | null; tab: SectionTab | null } {
  for (const s of SECTIONS) {
    const tab = [...s.tabs].sort((a, b) => b.href.length - a.href.length).find((t) => under(pathname, t.href) || t.also?.some((x) => under(pathname, x))) ?? null;
    if (tab || under(pathname, s.href) || s.also?.some((a) => under(pathname, a))) return { section: s, tab };
  }
  return { section: null, tab: null };
}

/** Pages that live outside the six sections, named for the phone header. */
export const PAGE_TITLES: [string, string][] = [
  ["/messages", "Messages"],
  ["/profile/complete", "Complete your profile"],
  ["/profile", "Profile"],
  ["/settings", "Settings"],
  ["/help", "Help"],
  ["/pages", "All pages"],
];

