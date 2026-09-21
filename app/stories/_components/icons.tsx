import { Airplane, Award, Book1, Brush2, Building, Key, Location, Microphone2, Musicnote, Heart, Profile2User } from "iconsax-reactjs";
import type { ArtworkStory, LegacyEvent } from "@/lib/types";

type InfluenceKind = ArtworkStory["influences"][number]["kind"];

export const INFLUENCE: Record<InfluenceKind, { label: string; Icon: typeof Musicnote }> = {
  music: { label: "Music", Icon: Musicnote },
  poem: { label: "Poem", Icon: Book1 },
  place: { label: "Place", Icon: Location },
  artist: { label: "Artist", Icon: Profile2User },
  memory: { label: "Memory", Icon: Heart },
};

export const LEGACY: Record<LegacyEvent["kind"], { label: string; Icon: typeof Musicnote }> = {
  created: { label: "Created", Icon: Brush2 },
  exhibited: { label: "Exhibited", Icon: Building },
  acquired: { label: "Acquired", Icon: Key },
  travelled: { label: "Travelled", Icon: Airplane },
  award: { label: "Award", Icon: Award },
  reflection: { label: "Reflection", Icon: Microphone2 },
};
