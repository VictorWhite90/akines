import type { Metadata } from "next";
import MeetingLobby from "@/components/collaborate/tools/MeetingLobby";

export const metadata: Metadata = { title: "Meeting · Akines" };

/** A project meeting's lobby: check your camera and microphone, then join. */
export default async function MeetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingLobby projectId={decodeURIComponent(id)} />;
}
