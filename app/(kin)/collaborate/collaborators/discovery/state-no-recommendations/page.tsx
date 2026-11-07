import type { Metadata } from "next";
import Discovery from "@/components/collaborate/collaborators/Discovery";

export const metadata: Metadata = { title: "Collaborators · Akines" };

/** The design's "no recommendations" state, at its own address. */
export default function NoRecommendationsPage() {
  return <Discovery forceEmpty />;
}
