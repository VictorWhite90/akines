import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** The design's state frame: your role lets you view and comment, not edit: the tools are dimmed. */
export default async function WorkspaceViewOnlyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} state="viewOnly" />;
}
