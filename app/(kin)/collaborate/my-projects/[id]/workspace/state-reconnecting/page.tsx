import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** The design's state frame: reconnecting to the workspace, then back to it after a moment. */
export default async function WorkspaceReconnectingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} state="reconnecting" />;
}
