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

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
