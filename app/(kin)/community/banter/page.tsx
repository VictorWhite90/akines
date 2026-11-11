import type { Metadata } from "next";
import BanterIntro from "@/components/banter/BanterIntro";
import { BANTER_NOW } from "@/lib/data/banter";

export const metadata: Metadata = { title: "Banter · Akines" };

/** Community Home's Banter page (the design's /community/banter): the open conversation happening now. */
export default function CommunityBanterPage() {
  return <BanterIntro session={BANTER_NOW[0]} />;
}
