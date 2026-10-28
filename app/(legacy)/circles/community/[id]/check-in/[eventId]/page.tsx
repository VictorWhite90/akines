import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CheckIn from "@/components/circles/community/CheckIn";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: "Check-in · Akines" };

export default async function CheckInPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  if (!FEATURES.eventCheckIn) notFound();
  const { id, eventId } = await params;
  return <CheckIn circleId={id} eventId={eventId} />;
}
