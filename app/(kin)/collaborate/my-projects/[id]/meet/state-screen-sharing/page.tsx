import type { Metadata } from "next";
import MeetingCall from "@/components/collaborate/tools/MeetingCall";

export const metadata: Metadata = { title: "Meeting · Akines" };

/** The design's In call / Screen sharing frame: the call with your screen shared. */
export default async function MeetCallScreenSharingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingCall projectId={decodeURIComponent(id)} simulate initial={{ presenting: true }} />;
}
