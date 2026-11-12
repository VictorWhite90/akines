import type { Metadata } from "next";
import MeetingCall from "@/components/collaborate/tools/MeetingCall";

export const metadata: Metadata = { title: "Meeting · Akines" };

/** The design's In call / People frame: the call with the People panel open. */
export default async function MeetCallPeoplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingCall projectId={decodeURIComponent(id)} simulate initial={{ panel: "people" }} />;
}
