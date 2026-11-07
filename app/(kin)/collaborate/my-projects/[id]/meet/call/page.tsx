import type { Metadata } from "next";
import MeetingCall from "@/components/collaborate/tools/MeetingCall";

export const metadata: Metadata = { title: "Meeting · Akines" };

/** A project meeting in progress. */
export default async function MeetCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingCall projectId={decodeURIComponent(id)} />;
}
