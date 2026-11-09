import type { Metadata } from "next";
import EventPage from "@/components/connect/Event";
import { eventById } from "@/lib/connect/events";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${eventById(decodeURIComponent(id))?.title ?? "Event"} · Akines` };
}

/** Connect, an event: Register, the Register dialog, Registered and the toast. */
export default async function ConnectEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventPage id={decodeURIComponent(id)} />;
}
