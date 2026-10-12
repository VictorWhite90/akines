import { CIRCLES, PEOPLE } from "@/lib/data";

const ROLE_TAG: Partial<Record<string, string>> = { curator: "Curator", gallery: "Gallery", institution: "Institution", collector: "Collector", researcher: "Researcher" };

/** Small role tags beside names: moderators first, then professional roles. */
export function roleTagsFor(circleId?: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const p of PEOPLE) {
    const tag = ROLE_TAG[p.role];
    if (tag) tags[p.id] = tag;
  }
  const circle = CIRCLES.find((c) => c.id === circleId);
  circle?.moderatorIds.forEach((id) => (tags[id] = "Moderator"));
  return tags;
}
