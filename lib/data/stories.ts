import type { ArtworkStory, JournalEntry, StudioVisit } from "@/lib/types";
import { IMG } from "./images";

/** Artwork pages as stories: voice, process, failure, meaning, and a living legacy. */
export const STORIES: ArtworkStory[] = [
  {
    id: "indigo-crossing", title: "Indigo Crossing", artistId: "adaeze", image: IMG.textile, year: "2026", medium: "Hand-dyed indigo, salvaged cotton, thread", dimensions: "180 × 240 cm", price: "US$4,800",
    meaning: "A map of my grandmother's journey from Kano to Lagos, stitched from cloth she never talked about.",
    voiceNote: { duration: "3:42", transcript: "My grandmother kept one wrapper folded at the bottom of her box for fifty years. When she died I opened it and it still smelled of the dye pits in Kano. This piece is me finally asking her about that journey — in the only language we shared, which was cloth." },
    studioVideo: { duration: "6:10", poster: IMG.studioWide, caption: "Dyeing day at the Kofar Mata pits, Kano" },
    evolution: [
      { stage: "First sketch", note: "Routes drawn on tracing paper over an old road map.", date: "Jan" },
      { stage: "Failed dye bath", note: "The first vat went green — too much lime. Kept one panel anyway.", date: "Feb" },
      { stage: "Weaving", note: "Salvaged cotton from Balogun market woven into the gaps.", date: "Apr" },
      { stage: "Finished", note: "Hung for the first time in the Textiles Circle review.", date: "Jun" },
    ],
    materials: ["Natural indigo (Kofar Mata pits)", "Salvaged Balogun cotton", "Hand-spun thread"],
    influences: [
      { kind: "music", text: "Fela — “Water No Get Enemy”" },
      { kind: "memory", text: "My grandmother's wrapper, 1971" },
      { kind: "place", text: "The road from Kano to Lagos" },
      { kind: "poem", text: "Gabriel Okara — “Piano and Drums”" },
    ],
    challenges: "The green vat almost ended the series. I kept that panel — it's the part of the journey nobody planned.",
    legacy: [
      { date: "Jun 2026", kind: "created", text: "Completed in Lagos", personId: "adaeze", place: "Lagos", source: "verified" },
      { date: "Jul 2026", kind: "exhibited", text: "Shown at the Textiles Circle portfolio review", place: "Online", source: "verified" },
      { date: "Aug 2026", kind: "acquired", text: "Acquired by Chidi Eze", personId: "chidi", place: "London", source: "verified" },
      { date: "Aug 2026", kind: "travelled", text: "Shipped Lagos → London", place: "London", source: "verified" },
      { date: "Sep 2026", kind: "reflection", text: "Collector's audio reflection added", personId: "chidi", source: "self-declared" },
    ],
    collectorEntries: [
      { personId: "chidi", date: "Sep 2026", livesIn: "Hallway, facing the front door", text: "My mother left Kano for Enugu in 1974. I bought this because she stood in front of it for twenty minutes and then told me a story I'd never heard. My kids walk past it every morning; my daughter calls it ‘Grandma's river’." },
    ],
  },
  {
    id: "vessel-for-rain", title: "Vessel for Rain", artistId: "fatima", image: IMG.ceramics, year: "2025", medium: "Local red clay, wood-fired", dimensions: "62 × 40 cm",
    meaning: "A water jar shaped by three generations of potters' hands — and a question about who inherits a craft.",
    voiceNote: { duration: "2:18", transcript: "My grandfather's thumbprint is on the inside of every jar he made. I make my jars the same way so that one day someone finds mine." },
    studioVideo: { duration: "4:02", poster: IMG.ceramics, caption: "Wood-firing in Marrakech" },
    evolution: [{ stage: "Throwing", note: "Thrown in two halves.", date: "Mar" }, { stage: "Cracked in firing", note: "Mended with gold slip.", date: "Apr" }, { stage: "Finished", note: "", date: "May" }],
    materials: ["Local red clay", "Wood ash glaze"],
    influences: [{ kind: "artist", text: "Ladi Kwali" }, { kind: "place", text: "Riad courtyards" }],
    challenges: "It cracked in the kiln. The mend is now the point.",
    legacy: [{ date: "May 2025", kind: "created", text: "Completed in Marrakech", personId: "fatima", place: "Marrakech", source: "verified" }, { date: "Nov 2025", kind: "award", text: "Shortlisted, Pan-African Craft Prize", source: "verified" }],
    collectorEntries: [],
  },
  {
    id: "street-saints", title: "Street Saints", artistId: "kwame", image: IMG.paintingStudio, year: "2026", medium: "Oil on canvas", dimensions: "200 × 150 cm", price: "US$2,900",
    meaning: "My neighbours, painted at the size we paint saints.",
    voiceNote: { duration: "1:55", transcript: "Everyone on my street has a story someone should paint big." },
    studioVideo: { duration: "3:30", poster: IMG.paintingStudio, caption: "Studio, Jamestown, Accra" },
    evolution: [{ stage: "Sittings", note: "Six neighbours, one afternoon each.", date: "Feb" }, { stage: "Finished", note: "", date: "Apr" }],
    materials: ["Oil paint", "Cotton duck canvas"],
    influences: [{ kind: "place", text: "Jamestown, Accra" }, { kind: "artist", text: "Church murals in Cape Coast" }],
    challenges: "Paying sitters fairly on a student budget.",
    legacy: [{ date: "Apr 2026", kind: "created", text: "Completed in Accra", personId: "kwame", place: "Accra", source: "self-declared" }],
    collectorEntries: [],
  },
];

/** Living journals — artists' process and collectors' lives with the work. */
export const JOURNAL: JournalEntry[] = [
  { id: "j1", authorId: "adaeze", kind: "failure", date: "Today", text: "Vat went green again. Lime ratio is off in the dry season — writing it down so I stop repeating this.", image: IMG.textile, visibility: "public", storyId: "indigo-crossing" },
  { id: "j2", authorId: "moussa", kind: "sketch", date: "Yesterday", text: "Dakar harbour, 5:12am. The gulls start before the engines. That order matters for the piece.", visibility: "public" },
  { id: "j3", authorId: "tunde", kind: "doubt", date: "Yesterday", text: "Three weeks on one canvas and I still can't tell if it's finished or abandoned.", visibility: "circle" },
  { id: "j4", authorId: "chidi", kind: "collector", date: "2 days ago", text: "Moved Indigo Crossing to the hallway. It changes colour with the morning light — nobody told me cloth does that.", visibility: "public", storyId: "indigo-crossing" },
  { id: "j5", authorId: "kwame", kind: "win", date: "3 days ago", text: "Shortlisted for Figure & Ground. First time a curator has asked about my process, not my price.", visibility: "public" },
  { id: "j6", authorId: "fatima", kind: "idea", date: "4 days ago", text: "What if the courtyard drain was the sculpture? Sent a note to Sipho.", image: IMG.ceramics, visibility: "public" },
  { id: "j7", authorId: "zuri", kind: "collector", date: "Last week", text: "Bought my second photograph. I hung it where I have coffee so I start every day looking at something that isn't a screen.", visibility: "public" },
  { id: "j8", authorId: "adaeze", kind: "doubt", date: "Last week", text: "Private: not sure I can afford the Kano trip this quarter.", visibility: "private" },
];

export const STUDIO_VISITS: StudioVisit[] = [
  { id: "sv1", artistId: "adaeze", title: "Dye pits & loom: inside Indigo Crossing", when: "Sat · 10:00 WAT", format: "live", seats: 12, seatsLeft: 5, image: IMG.textile, description: "Walk through the dyeing process live and ask about any piece in the studio." },
  { id: "sv2", artistId: "fatima", title: "360° wood-fired kiln tour", when: "Any time", format: "360", seats: 0, seatsLeft: 0, image: IMG.ceramics, description: "Look around the kiln yard at your own pace, with the artist's audio notes." },
  { id: "sv3", artistId: "kwame", title: "Street Saints studio open day", when: "Sun · 15:00 GMT", format: "live", seats: 20, seatsLeft: 14, image: IMG.paintingStudio, description: "Meet the painter and the neighbours who sat for the series." },
  { id: "sv4", artistId: "ayo", title: "VR: a day in the tailoring studio", when: "Any time", format: "vr", seats: 0, seatsLeft: 0, image: IMG.fashion, description: "Headset or phone — stand beside the cutting table." },
];

export function getStory(id: string) {
  return STORIES.find((story) => story.id === id);
}
