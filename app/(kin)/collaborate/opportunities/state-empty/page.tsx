import type { Metadata } from "next";
import Opportunities from "@/components/collaborate/projects/Opportunities";

export const metadata: Metadata = { title: "Opportunities · Akines" };

/** The design's Empty frame, at its own address. */
export default function OpportunitiesEmptyPage() {
  return <Opportunities variant="empty" />;
}
