import type { Metadata } from "next";
import { EventsPage } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "Events · Akines" };

/** The design's No results state (This week on), at its own address. */
export default function EventsNoResultsPage() {
  return <EventsPage initial="week" empty />;
}
