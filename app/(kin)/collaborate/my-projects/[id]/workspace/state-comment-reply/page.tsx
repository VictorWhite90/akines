import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** The design's state frame: the document's first comment thread open for a reply. */
export default async function WorkspaceCommentReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} state="commentReply" />;
}
