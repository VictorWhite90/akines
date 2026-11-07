import type { Metadata } from "next";
import Workspace from "@/components/collaborate/tools/Workspace";

export const metadata: Metadata = { title: "Workspace · Akines" };

/** A project's shared canvas or document, full screen. */
export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace projectId={decodeURIComponent(id)} />;
}
