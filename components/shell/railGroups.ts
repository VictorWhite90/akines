import { Brush2, Discover, Heart, People, Star1 } from "iconsax-reactjs";
import { NAV_GROUPS, isActive, type NavItem } from "./nav";

export type RailGroup = { id: string; label: string; Icon: typeof Star1; href: string; items: NavItem[]; dot?: boolean };

const group = (label: string) => NAV_GROUPS.find((g) => g.label === label)?.items ?? [];

/** The Night sky rail: five places, each opening onto the pages that belong to it. */
export const RAIL: RailGroup[] = [
  {
    id: "sky",
    label: "Your sky",
    Icon: Star1,
    href: "/",
    items: [
      { href: "/", label: "Constellation", glyph: "✶" },
      { href: "/community", label: "The Weekly (new)", glyph: "▦" },
      { href: "/community/classic", label: "Community board (classic)", glyph: "▤" },
      { href: "/atelier", label: "Today (new)", glyph: "◌" },
      { href: "/atelier/introduction", label: "Introduction (new)", glyph: "∞" },
      { href: "/atelier/room", label: "Presence room (new)", glyph: "◯" },
    ],
  },
  { id: "connect", label: "Connect", Icon: People, href: "/banter", items: group("Connect"), dot: true },
  { id: "make", label: "Make & sell", Icon: Brush2, href: "/studio", items: group("Make & sell") },
  { id: "explore", label: "Explore", Icon: Discover, href: "/shop", items: group("Explore") },
  { id: "care", label: "Care", Icon: Heart, href: "/wellbeing", items: group("Care") },
];

/** The rail group the current page belongs to (home matches exactly). */
export function activeGroup(pathname: string): RailGroup {
  return RAIL.find((g) => g.items.some((i) => (i.href === "/" ? pathname === "/" : isActive(pathname, i.href)))) ?? RAIL[0];
}
