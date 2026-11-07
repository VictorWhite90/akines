export type NavItem = { href: string; label: string; glyph: string; badge?: string };
export type NavGroup = { label?: string; items: NavItem[] };

/** The rail is grouped by what a member is doing, so nothing feels scattered. */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: "/", label: "Community home", glyph: "home" }] },
  {
    label: "Connect",
    items: [
      { href: "/kindred", label: "Discover people", glyph: "people" },
      { href: "/banter", label: "Banter", glyph: "banter", badge: "2 live" },
      { href: "/circles", label: "KinCircle", glyph: "circle" },
      { href: "/cliqs", label: "Cliqs", glyph: "cliq" },
      { href: "/rooms", label: "Presence rooms", glyph: "live", badge: "3 live" },
      { href: "/play", label: "Play Together", glyph: "play" },
      { href: "/activities", label: "Activities", glyph: "▦" },
      { href: "/collaborate", label: "Collaborate", glyph: "collaborate", badge: "12 open" },
      { href: "/messages", label: "KinMessage", glyph: "message" },
    ],
  },
  {
    label: "Make & sell",
    items: [
      { href: "/studio", label: "My studio", glyph: "studio" },
      { href: "/journal", label: "My journal", glyph: "journal" },
      { href: "/store", label: "My store", glyph: "store" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/shop", label: "Marketplace", glyph: "□" },
      { href: "/studios", label: "Open doors", glyph: "open-doors" },
      { href: "/stories", label: "Stories", glyph: "stories" },
    ],
  },
  {
    label: "Care",
    items: [
      { href: "/wellbeing", label: "Wellbeing", glyph: "wellbeing" },
      { href: "/dna", label: "Creative DNA", glyph: "dna" },
      { href: "/about", label: "About Akines", glyph: "about" },
    ],
  },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/**
 * The app header (components/kin/Header.tsx): six sections as icons, and the pages of the open section
 * as tabs beneath. Same places as NAV_GROUPS, arranged the way the product design arranges them.
 */
export type SectionKey = "home" | "connect" | "collaborate" | "make" | "explore" | "care";
/** A tab, and other paths that should show it as the current one. */
export type SectionTab = { href: string; label: string; also?: string[] };
export type Section = { key: SectionKey; label: string; href: string; tabs: SectionTab[]; also?: string[] };

export const SECTIONS: Section[] = [
  // The design keeps Messages, Settings, the three care screens and your collaborations inside Community Home.
  { key: "home", label: "Community Home", href: "/", tabs: [], also: ["/notifications", "/messages", "/settings", "/wellbeing/quiet", "/wellbeing/reflect", "/wellbeing/support", "/community/collaborations"] },
  {
    key: "connect",
    label: "Connect",
    href: "/connect",
    // The design's Connect tabs. Cliqs, Play Together and the older Discover (/kindred) stay in Connect without a tab.
    tabs: [
      { href: "/connect", label: "Discover" },
      { href: "/circles", label: "KinCircle" },
      { href: "/rooms", label: "Rooms" },
      { href: "/banter", label: "Banter" },
      { href: "/activities", label: "Activities" },
    ],
    also: ["/kindred", "/cliqs", "/play"],
  },
  {
    key: "collaborate",
    label: "Collaborate",
    href: "/collaborate",
    // The design's Collaborate tabs; a project's page, saved projects and member pages sit under Discover Projects.
    tabs: [
      { href: "/collaborate", label: "Home" },
      { href: "/collaborate/discover", label: "Discover Projects", also: ["/collaborate/projects", "/collaborate/saved", "/collaborate/members"] },
      { href: "/collaborate/my-projects", label: "My Projects", also: ["/collaborate/start"] },
      { href: "/collaborate/collaborators", label: "Collaborators", also: ["/collaborate/introduction-requests", "/collaborate/saved-collaborators"] },
      { href: "/collaborate/opportunities", label: "Opportunities" },
      { href: "/collaborate/contributions", label: "My Contributions" },
    ],
  },
  {
    key: "make",
    label: "Make & Sell",
    href: "/studio",
    tabs: [
      { href: "/studio", label: "My Studio" },
      { href: "/journal", label: "My Journal" },
      { href: "/store", label: "My Store" },
    ],
  },
  {
    key: "explore",
    label: "Explore",
    href: "/shop",
    tabs: [
      { href: "/shop", label: "Shop Art" },
      { href: "/studios", label: "Studio Visits" },
      { href: "/stories", label: "Stories and Legacy" },
    ],
  },
  {
    key: "care",
    label: "Care",
    href: "/wellbeing",
    tabs: [
      { href: "/wellbeing", label: "Creative Wellbeing" },
      { href: "/dna", label: "Creative DNA" },
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
  ["/notifications", "Notifications"],
  ["/profile", "Profile"],
  ["/settings", "Settings"],
  ["/u/", "Profile"],
  ["/about", "About Akines"],
  ["/pages", "All pages"],
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
