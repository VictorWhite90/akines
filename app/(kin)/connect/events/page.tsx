import type { Metadata } from "next";
import { EventsPage } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "Events · Akines" };

/** Connect, Discover, Events. */
export default function ConnectEventsPage() {
  return <EventsPage />;
}
