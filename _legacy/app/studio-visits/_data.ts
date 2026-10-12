import { IMG, STUDIO_VISITS } from "@/lib/data";
import type { StudioVisit } from "@/lib/types";

/** Route-local visits so every format (including recorded, and a full live visit) is represented. */
const EXTRA_VISITS: StudioVisit[] = [
  { id: "sv5", artistId: "fatima", title: "Glazing day in the courtyard studio", when: "Thu · 17:00 WET", format: "live", seats: 8, seatsLeft: 0, image: IMG.heroStudio, description: "Fatima mixes glazes from local minerals and explains why some vessels are left unglazed to breathe." },
  { id: "sv6", artistId: "wanjiru", title: "Printing a dawn market onto cloth", when: "Watch any time · 18 min", format: "recorded", seats: 0, seatsLeft: 0, image: IMG.photography, description: "From negative to market cloth, with Wanjiru's notes on every failed print along the way." },
  { id: "sv7", artistId: "fatima", title: "Throwing a rainwater vessel", when: "Watch any time · 24 min", format: "recorded", seats: 0, seatsLeft: 0, image: IMG.sculpture, description: "One vessel, start to finish, narrated in Arabic, French and English." },
];

export const VISITS: StudioVisit[] = [...STUDIO_VISITS, ...EXTRA_VISITS];

export const FORMAT_GROUPS: { format: StudioVisit["format"]; title: string; label: string; description: string }[] = [
  { format: "live", title: "Live visits", label: "Live", description: "A small group, the artist, and their studio in real time. Ask anything." },
  { format: "360", title: "360° studios", label: "360°", description: "Look around at your own pace, with the artist's audio notes on what you're seeing." },
  { format: "vr", title: "VR visits", label: "VR", description: "Headset or phone. Stand where the artist stands." },
  { format: "recorded", title: "Recorded visits", label: "Recorded", description: "Filmed in the studio, with the artist's own narration. Watch any time." },
];

export const HOTSPOTS = [
  { id: "kiln", label: "The kiln door", deg: 40, note: "“We fire with olive wood from my uncle's grove. The door is bricked up by hand every time.” — Fatima" },
  { id: "clay", label: "Clay store", deg: 150, note: "“Red clay from the Ourika valley. It remembers water — that's why the vessels hold it so well.”" },
  { id: "racks", label: "Drying racks", deg: 260, note: "“Two weeks in the shade before firing. Rush it and they crack. I've lost a whole season that way.”" },
];
