import { CIRCLES, ROOMS } from "@/lib/data/connect";

/** Which space the current path lives in. Drives the rail and channel list. */
export type SpaceId = "home" | "studio" | "opportunities" | "gallery" | `circle:${string}`;

const HOME = ["/", "/introductions", "/dm", "/onboarding", "/dna", "/wellbeing", "/trust", "/membership", "/people", "/companion", "/concept", "/pilot", "/rooms"];

export function matchesPath(pathname: string, prefix: string) {
  return prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function currentSpace(pathname: string): SpaceId {
  const circle = pathname.match(/^\/(?:c|circles)\/([^/]+)/);
  if (circle && CIRCLES.some((c) => c.id === circle[1])) return `circle:${circle[1]}`;
  const room = pathname.match(/^\/rooms\/([^/]+)/);
  if (room) {
    const circleId = ROOMS.find((r) => r.id === room[1])?.circleId;
    if (circleId) return `circle:${circleId}`;
  }
  if (["/studio"].some((p) => matchesPath(pathname, p))) return "studio";
  if (["/opportunities", "/applications", "/curator"].some((p) => matchesPath(pathname, p))) return "opportunities";
  if (["/stories", "/journals", "/studio-visits"].some((p) => matchesPath(pathname, p))) return "gallery";
  if (HOME.some((p) => matchesPath(pathname, p))) return "home";
  return "home";
}
