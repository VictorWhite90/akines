import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventView from "@/components/circles/community/EventView";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: "Event · Akines" };

export default async function EventPage({ params, searchParams }: { params: Promise<{ id: string; eventId: string }>; searchParams: Promise<{ created?: string }> }) {
  if (!FEATURES.communityEvents) notFound(); // events aren't on the backend yet
  const { id, eventId } = await params;
  const { created } = await searchParams;
  return <EventView circleId={id} eventId={eventId} created={created === "1"} />;
}
