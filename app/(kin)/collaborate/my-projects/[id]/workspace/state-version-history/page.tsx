import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** The design's state frame: the version history open, previewing an older version. */
export default async function WorkspaceVersionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} state="versionHistory" />;
}
