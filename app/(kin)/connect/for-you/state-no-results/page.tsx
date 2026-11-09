import type { Metadata } from "next";
import { ForYouAll } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "For you on Akines · Akines" };

/** The design's No results state (Studio Visits on), at its own address. */
export default function ForYouNoResultsPage() {
  return <ForYouAll initial="studio-visits" empty />;
}
