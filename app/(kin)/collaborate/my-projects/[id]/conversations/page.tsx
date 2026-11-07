import type { Metadata } from "next";
import Conversations from "@/components/collaborate/workspace/Conversations";

export const metadata: Metadata = { title: "Conversations · Akines" };

/** A project's conversations, opening the most recent. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  return <Conversations projectId={p.id} />;
}
