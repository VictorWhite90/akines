import {
  Book1, Briefcase, Chart2, Colorfilter, Crown1, DocumentText, Home2, Layer, Lovely, Messages2,
  Note1, People, Profile2User, Radar, ShieldTick, TaskSquare, VideoPlay,
} from "iconsax-reactjs";

export type NavItem = { href: string; label: string; Icon: typeof Home2; note?: string };
export type NavGroup = { id: string; label: string; items: NavItem[] };

/**
 * Connect (human community) and Create (opportunity & collaboration) are the
 * two new pillars; Discover — the marketplace — lives on artelia.art.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "connect",
    label: "Connect",
    items: [
      { href: "/", label: "Today", Icon: Home2 },
      { href: "/introductions", label: "Introductions", Icon: People },
      { href: "/rooms", label: "Presence Rooms", Icon: Messages2 },
      { href: "/circles", label: "Creative Circles", Icon: Profile2User },
      { href: "/stories", label: "Stories", Icon: Book1 },
      { href: "/journals", label: "Journals", Icon: Note1 },
      { href: "/studio-visits", label: "Studio visits", Icon: VideoPlay },
    ],
  },
  {
    id: "create",
    label: "Create",
    items: [
      { href: "/opportunities", label: "Open calls", Icon: Briefcase },
      { href: "/applications", label: "My applications", Icon: TaskSquare },
      { href: "/studio", label: "Collaboration Studio", Icon: Layer },
      { href: "/curator", label: "Curator Desk", Icon: Radar, note: "For curators" },
    ],
  },
  {
    id: "you",
    label: "You",
    items: [
      { href: "/dna", label: "Creative DNA", Icon: Colorfilter },
      { href: "/wellbeing", label: "Wellbeing", Icon: Lovely, note: "Private" },
      { href: "/trust", label: "Trust & privacy", Icon: ShieldTick },
      { href: "/membership", label: "Membership", Icon: Crown1 },
    ],
  },
  {
    id: "about",
    label: "About this prototype",
    items: [
      { href: "/pilot", label: "Pilot & measures", Icon: Chart2 },
      { href: "/concept", label: "Concept coverage", Icon: DocumentText },
    ],
  },
];

/** The four destinations pinned to the mobile tab bar (plus "More"). */
export const MOBILE_TABS = ["/", "/introductions", "/rooms", "/studio"];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
