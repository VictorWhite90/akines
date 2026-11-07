import type { Metadata } from "next";
import WhyMatch from "@/components/collaborate/collaborators/WhyMatch";

export const metadata: Metadata = { title: "Why this match · Akines" };

/** Why this match, for the first recommendation (the design's address); each person's is at /collaborators/<id>/why-this-match. */
export default function WhyThisMatchPage() {
  return <WhyMatch />;
}
