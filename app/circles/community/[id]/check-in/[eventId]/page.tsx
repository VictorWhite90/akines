import type { Metadata } from "next";
import CheckIn from "@/components/circles/community/CheckIn";

export const metadata: Metadata = { title: "Check-in · Akines" };

export default async function CheckInPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  return <CheckIn circleId={id} eventId={eventId} />;
}
