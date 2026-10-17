export type NavItem = { href: string; label: string; glyph: string; badge?: string };
export type NavGroup = { label?: string; items: NavItem[] };

/** The rail is grouped by what a member is doing, so nothing feels scattered. */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: "/", label: "Community home", glyph: "⌂" }] },
  {
    label: "Connect",
    items: [
      { href: "/kindred", label: "Discover people", glyph: "◇" },
      { href: "/banter", label: "Banter", glyph: "❝", badge: "2 live" },
      { href: "/circles", label: "KinCircle", glyph: "◎" },
      { href: "/cliqs", label: "Cliqs", glyph: "◌" },
      { href: "/rooms", label: "Presence rooms", glyph: "◉", badge: "3 live" },
      { href: "/play", label: "Play Together", glyph: "☺" },
      { href: "/activities", label: "Activities", glyph: "▦" },
      { href: "/collaborate", label: "Collaborate", glyph: "⌘", badge: "12 open" },
      { href: "/messages", label: "KinMessage", glyph: "✉" },
    ],
  },
  {
    label: "Make & sell",
    items: [
      { href: "/studio", label: "My studio", glyph: "✦" },
      { href: "/journal", label: "My journal", glyph: "▤" },
      { href: "/store", label: "My store", glyph: "▣" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/shop", label: "Marketplace", glyph: "□" },
      { href: "/studios", label: "Open doors", glyph: "◈" },
      { href: "/stories", label: "Stories & legacy", glyph: "❖" },
    ],
  },
  {
    label: "Care",
    items: [
      { href: "/wellbeing", label: "Creative wellbeing", glyph: "♡" },
      { href: "/dna", label: "Creative DNA", glyph: "◐" },
      { href: "/about", label: "About Akines", glyph: "ⓘ" },
    ],
  },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
