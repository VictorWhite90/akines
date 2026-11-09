import type { Metadata } from "next";
import { DecisionsList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Decisions · Akines" };

/** Collaborate, Decisions awaiting you: across all the member's projects. */
export default function DecisionsPage() {
  return <DecisionsList />;
}
