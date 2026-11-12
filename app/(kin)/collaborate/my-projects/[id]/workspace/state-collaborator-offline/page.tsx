import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** The design's state frame: a collaborator lost connection: their avatar shows offline and a banner says so. */
export default async function WorkspaceCollaboratorOfflinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} state="collaboratorOffline" />;
}
