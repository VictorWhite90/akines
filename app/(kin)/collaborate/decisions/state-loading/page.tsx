import type { Metadata } from "next";
import { DecisionsList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Decisions · Akines" };

/** The design's loading state, at its own address: the skeleton, then the list. */
export default function DecisionsLoadingPage() {
  return <DecisionsList variant="loading" />;
}
