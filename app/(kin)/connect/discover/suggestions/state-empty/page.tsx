import type { Metadata } from "next";
import { Suggestions } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "People for you · Akines" };

/** The design's Empty state, at its own address. */
export default function SuggestionsEmptyPage() {
  return <Suggestions empty />;
}
