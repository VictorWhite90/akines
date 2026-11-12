import type { Metadata } from "next";
import MeetingLobby from "@/components/collaborate/tools/MeetingLobby";

export const metadata: Metadata = { title: "Meeting · Akines" };

/** The design's Lobby / Camera off frame: the lobby with your camera off, no devices asked for. */
export default async function MeetCameraOffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingLobby projectId={decodeURIComponent(id)} cameraOff />;
}
