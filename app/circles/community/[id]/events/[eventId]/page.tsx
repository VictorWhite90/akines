import type { Metadata } from "next";
import EventView from "@/components/circles/community/EventView";

export const metadata: Metadata = { title: "Event · Akines" };

export default async function EventPage({ params, searchParams }: { params: Promise<{ id: string; eventId: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id, eventId } = await params;
  const { created } = await searchParams;
  return <EventView circleId={id} eventId={eventId} created={created === "1"} />;
}
