import type { Circle } from "./community";
import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/**
 * "People bond more effectively when they do something together" (brief §6).
 * A Circle's Activities tab: a few in-person or virtual things members are doing together,
 * with a lightweight RSVP the member's browser remembers (see components/circles/CircleSpace.tsx).
 */
export type Activity = {
  id: string;
  title: string;
  when: string;
  where: string;
  mode: "In person" | "Virtual";
  blurb: string;
  going: PersonId[];
  photo: PhotoKey | (string & {});
};

/** The product design's activities (Community Home, "Things to do together"), placed in its two circles. */
export const ACTIVITIES: Record<string, Activity[]> = {
  textiles: [
    { id: "indigo", title: "Indigo dyeing for beginners", when: "Sat · 16:00", where: "Yaba, Lagos", mode: "In person", blurb: "Learn the first three dye baths and take your cloth home.", going: ["ayo-balogun", "folake"], photo: "/kin/design/home/feed/post1-a.jpg" },
    { id: "sketch", title: "Sunday sketch walk", when: "Sun · 10:00", where: "Freedom Park, Lagos", mode: "In person", blurb: "Two slow hours with a sketchbook and a small group.", going: ["folake", "ngozi"], photo: "/kin/design/home/feed/studio-3.jpg" },
  ],
  poetry: [
    { id: "writing", title: "Writing together, online", when: "Wed · 18:30", where: "Online", mode: "Virtual", blurb: "A gentle hour of quiet writing, then one shared paragraph.", going: ["amara-okafor", "ngozi"], photo: "/kin/design/home/feed/journal-1.jpg" },
  ],
};

/** A circle's activities, or a small generic fallback if one hasn't been seeded yet. */
export function circleActivities(circle: Circle): Activity[] {
  return (
    ACTIVITIES[circle.id] ?? [
      { id: `${circle.id}-meetup`, title: `${circle.name} meetup`, when: "Sat · 11:00", where: "Video call", mode: "Virtual", blurb: "An informal get-together for whoever's free. Details firm up closer to the date.", going: [], photo: circle.photo },
    ]
  );
}
