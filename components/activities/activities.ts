import { circleActivities, type Activity } from "@/lib/data/circleActivities";
import { CIRCLES, type Circle } from "@/lib/data/community";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/** One Activity plus which circle it belongs to, for the cross-circle Activities page. */
export type FlatActivity = Activity & { circleId: string; circleName: string };

/** Every activity across every circle — the "Activities" layer isn't only a circle sub-tab (brief §6). */
export function allActivities(): FlatActivity[] {
  return CIRCLES.flatMap((c) => circleActivities(c).map((a) => ({ ...a, circleId: c.id, circleName: c.name })));
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Today's weekday, Monday-first, to match the "Sat · 10:00" style `when` strings. */
export function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

/** How many days from today an activity's `when` day falls, cyclic (0 = today, 6 = as late as it gets). Unknown days sort last. */
export function dayDistance(when: string, today = todayIndex()): number {
  const day = when.split("·")[0]?.trim();
  const idx = DAYS.indexOf(day);
  if (idx === -1) return 99;
  return (idx - today + 7) % 7;
}

/** A short, human label for how soon an activity is, from its day distance. */
export function soonLabel(distance: number): string {
  if (distance === 0) return "Today";
  if (distance === 1) return "Tomorrow";
  if (distance <= 6) return "This week";
  return "Coming up";
}

/** The city an activity "belongs to" — the most common city among the people already going, our proxy for location. */
export function activityCity(a: Activity): string | undefined {
  const cities = a.going.map((id) => PEOPLE[id as PersonId]?.city).filter(Boolean) as string[];
  if (cities.length === 0) return undefined;
  const counts = new Map<string, number>();
  cities.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  return [...counts.entries()].sort((a1, b1) => b1[1] - a1[1])[0][0];
}

/** The handful of cities that show up most among the seed people — the fallback "nearby" cluster when nothing matches exactly. */
export function topCities(allPeople: { city: string }[], n = 4): string[] {
  const counts = new Map<string, number>();
  allPeople.forEach((p) => counts.set(p.city, (counts.get(p.city) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([city]) => city);
}

/** 2–3 circles with the most "going" overlap with people from `city` — an approximation of "circles nearby" from activity data alone. */
export function circlesNearCity(city: string, n = 3): Circle[] {
  const localIds = new Set(Object.values(PEOPLE).filter((p) => p.city === city).map((p) => p.id));
  const scored = CIRCLES.map((c) => {
    const acts = circleActivities(c);
    const count = acts.reduce((sum, a) => sum + a.going.filter((id) => localIds.has(id)).length, 0);
    return { c, count };
  }).sort((a, b) => b.count - a.count);
  const withLocals = scored.filter((s) => s.count > 0).slice(0, n).map((s) => s.c);
  if (withLocals.length > 0) return withLocals;
  return CIRCLES.slice().sort((a, b) => b.active - a.active).slice(0, n);
}

/** A light emoji cue for an activity's flavour, for the "X Tonight" digest — the brief's own example leans on emoji, not chrome glyphs. */
export function activityEmoji(title: string): string {
  const t = title.toLowerCase();
  if (/(gallery|exhibition|studio|paint|art\b|crawl)/.test(t)) return "🎨";
  if (/(coffee|café|cafe)/.test(t)) return "☕";
  if (/(cycl|bike)/.test(t)) return "🚴";
  if (/(jazz|music|concert)/.test(t)) return "🎵";
  if (/(dinner|cook|meal|breakfast)/.test(t)) return "🍽️";
  if (/(walk|market)/.test(t)) return "🚶";
  if (/(photo|contact sheet|print)/.test(t)) return "📷";
  if (/(dye|textile|weav|adire|fabric|pattern.cut)/.test(t)) return "🧵";
  if (/(glaze|kiln|clay|wheel|ceramic)/.test(t)) return "🏺";
  if (/(book|read|portfolio|wall.text)/.test(t)) return "📚";
  if (/(carv|mask)/.test(t)) return "🪵";
  return "✺";
}
