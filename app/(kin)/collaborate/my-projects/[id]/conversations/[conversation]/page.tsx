import type { Metadata } from "next";
import Conversations from "@/components/collaborate/workspace/Conversations";

export const metadata: Metadata = { title: "Conversations · Akines" };

/** One of a project's conversations. */
export default async function Page({ params }: { params: Promise<{ id: string; conversation: string }> }) {
  const p = await params;
  return <Conversations projectId={p.id} threadId={p.conversation} />;
}
