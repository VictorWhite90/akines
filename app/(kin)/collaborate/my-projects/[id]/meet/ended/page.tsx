import type { Metadata } from "next";
import MeetingEnded from "@/components/collaborate/tools/MeetingEnded";

export const metadata: Metadata = { title: "Meeting ended · Akines" };

/** After you leave a project meeting. */
export default async function MeetEndedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingEnded projectId={decodeURIComponent(id)} />;
}
