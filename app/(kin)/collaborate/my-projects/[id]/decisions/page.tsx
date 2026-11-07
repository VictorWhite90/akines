import type { Metadata } from "next";
import Decisions from "@/components/collaborate/workspace/Decisions";

export const metadata: Metadata = { title: "Decisions · Akines" };

/** A project's decisions: the ones that need attention. */
export default async function DecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Decisions projectId={id} />;
}
