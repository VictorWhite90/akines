import type { Metadata } from "next";
import Decisions from "@/components/collaborate/workspace/Decisions";

export const metadata: Metadata = { title: "Decision history · Akines" };

/** A project's decisions: the ones already decided. */
export default async function DecisionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Decisions projectId={id} view="history" />;
}
