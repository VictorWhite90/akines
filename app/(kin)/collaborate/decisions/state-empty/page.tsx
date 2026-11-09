import type { Metadata } from "next";
import { DecisionsList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Decisions · Akines" };

/** The design's empty state, at its own address. */
export default function DecisionsEmptyPage() {
  return <DecisionsList variant="empty" />;
}
