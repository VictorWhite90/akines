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
  photo: PhotoKey;
};

export const ACTIVITIES: Record<string, Activity[]> = {
  "african-fashion": [
    { id: "af-market-walk", title: "Fabric market walk", when: "Sat · 10:00", where: "Balogun Market, Lagos", mode: "In person", blurb: "Sourcing trip with a few members who buy here every month. Bring cash and a trolley bag.", going: ["fatou", "ayo", "wanjiru"], photo: "textileRolls" },
    { id: "af-pattern-cut", title: "Pattern-cutting meetup", when: "Wed · 18:30", where: "Video call", mode: "Virtual", blurb: "Bring a bodice block you're stuck on. We'll cut through it together, screen-share and all.", going: ["chidi", "fatou"], photo: "kenteVest" },
  ],
  photography: [
    { id: "ph-golden-hour", title: "Golden-hour photo walk", when: "Sun · 17:15", where: "Meet at the old railway bridge", mode: "In person", blurb: "An hour of shooting, then coffee and a loose critique of whatever anyone got.", going: ["wanjiru", "zuri", "tunde"], photo: "galleryViewer" },
    { id: "ph-print-swap", title: "Print & swap: family archives", when: "Sat · 14:00", where: "Community darkroom, 2nd floor", mode: "In person", blurb: "Bring a print from a family album. Swap it for one you didn't grow up with.", going: ["efua", "thandi"], photo: "photoAlbum" },
    { id: "ph-contact-sheet", title: "Contact sheet review", when: "Thu · 19:00", where: "Video call", mode: "Virtual", blurb: "Share your unedited contact sheet, not just the keeper. We talk through the misses too.", going: ["zuri", "wanjiru", "nandi"], photo: "studioDim" },
  ],
  "digital-art": [
    { id: "da-collage-jam", title: "Collage jam night", when: "Fri · 20:00", where: "Video call", mode: "Virtual", blurb: "Ninety minutes, one shared mood board, no talking until the timer's up.", going: ["chidi", "nandi"], photo: "waxPrint" },
    { id: "da-studio-visit", title: "Studio visit: motion & pattern", when: "Sat · 12:00", where: "Chidi's studio, Yaba", mode: "In person", blurb: "See a motion piece being rigged frame by frame. Small group, bring your laptop.", going: ["chidi", "wanjiru", "zuri"], photo: "studioBusy" },
  ],
  textiles: [
    { id: "tx-indigo-day", title: "Indigo dye day", when: "Sat · 09:00", where: "Ayo's backyard vat", mode: "In person", blurb: "A full day at the vat: resist-tying in the morning, dyeing after lunch. Wear clothes you don't mind staining.", going: ["ayo", "efua", "chidi"], photo: "textileHang" },
    { id: "tx-weaving-circle", title: "Weaving circle", when: "Tue · 18:00", where: "The Loom Room, Surulere", mode: "In person", blurb: "Bring your own loom or borrow a lap one. We weave and talk, mostly in that order.", going: ["fatou", "ayo"], photo: "textileRolls" },
    { id: "tx-adire-swap", title: "Adire swap & share", when: "Sun · 16:00", where: "Video call", mode: "Virtual", blurb: "Show one length of cloth and where it came from. No selling, just stories.", going: ["chidi", "efua", "ayo"], photo: "textileStack" },
  ],
  ceramics: [
    { id: "ce-glaze-test", title: "Glaze-testing Saturday", when: "Sat · 11:00", where: "Studio 4, the co-op kiln", mode: "In person", blurb: "Bring test tiles. We fire a shared load and compare notes once it's cool.", going: ["thandi", "leila"], photo: "clayWheelTop" },
    { id: "ce-open-studio", title: "Wheel-throwing open studio", when: "Wed · 17:00", where: "Studio 4, the co-op kiln", mode: "In person", blurb: "Beginners welcome, wheels are shared. Come centre a lump of clay with company.", going: ["leila", "thandi", "zuri"], photo: "clayHands" },
    { id: "ce-kiln-watch", title: "Kiln-opening watch party", when: "Fri · 19:00", where: "Video call", mode: "Virtual", blurb: "Live unloading of the bisque kiln, disasters and all. Comment your guesses first.", going: ["thandi", "leila"], photo: "clayBrown" },
  ],
  collectors: [
    { id: "cl-gallery-walk", title: "Gallery hall walk-through", when: "Sat · 15:00", where: "Meet at the main hall entrance", mode: "In person", blurb: "A slow, unhurried walk through the new group show, then drinks to argue about it.", going: ["zuri", "leila", "kwame"], photo: "galleryHall" },
    { id: "cl-new-coffee", title: "New collectors' coffee", when: "Thu · 09:00", where: "Terra Café", mode: "In person", blurb: "For anyone who's bought fewer than five works. No question is too basic here.", going: ["kwame", "leila"], photo: "talkMugs" },
  ],
  curators: [
    { id: "cu-studio-crawl", title: "Studio-visit crawl", when: "Sat · 13:00", where: "Three studios, Yaba to Surulere", mode: "In person", blurb: "Three back-to-back studio visits, twenty minutes each, then we compare shortlists.", going: ["efua", "zuri"], photo: "galleryTwo" },
    { id: "cu-wall-text", title: "Wall-text writing workshop", when: "Tue · 18:00", where: "Video call", mode: "Virtual", blurb: "Bring a draft wall text. We cut it in half together and it's usually better for it.", going: ["efua", "zuri", "nandi"], photo: "journalWindow" },
  ],
  diaspora: [
    { id: "di-dinner", title: "Home-cooked dinner & stories", when: "Sun · 18:00", where: "Nandi's place", mode: "In person", blurb: "Everyone brings a dish their family makes. We eat before we talk about why.", going: ["nandi", "kwame", "leila"], photo: "talkCafe" },
    { id: "di-return", title: "Return journeys: a listening circle", when: "Wed · 19:30", where: "Video call", mode: "Virtual", blurb: "For anyone who's gone back, or is thinking about it. Mostly listening, gently facilitated.", going: ["nandi", "leila"], photo: "talkTwo" },
  ],
  "young-artists": [
    { id: "ya-critique-night", title: "First-show critique night", when: "Fri · 19:00", where: "The back room, Freedom Park", mode: "In person", blurb: "Bring documentation of your first show, real or upcoming. Kind, specific feedback only.", going: ["wanjiru", "chidi", "zuri"], photo: "talkLaugh" },
    { id: "ya-portfolio", title: "Portfolio review morning", when: "Sat · 10:00", where: "Video call", mode: "Virtual", blurb: "Ten minutes each, screen-shared. We look at sequencing as much as the individual pieces.", going: ["wanjiru", "nandi"], photo: "journalOpen" },
  ],
  "traditional-arts": [
    { id: "ta-carving-day", title: "Elder & apprentice carving day", when: "Sat · 09:00", where: "Tunde's workshop", mode: "In person", blurb: "A whole day at the bench with an elder carver. Bring your own tools if you have them.", going: ["tunde", "efua"], photo: "carvedGroup" },
    { id: "ta-mask-demo", title: "Mask-making demonstration", when: "Sun · 15:00", where: "Community hall, back room", mode: "In person", blurb: "Watch a mask carved start to finish, with time for questions between stages.", going: ["tunde"], photo: "tribalCarving" },
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
