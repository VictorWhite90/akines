import type { Metadata } from "next";
import Decision from "@/components/collaborate/workspace/Decision";

export const metadata: Metadata = { title: "Decision · Akines" };

/** One decision in a project. */
export default async function DecisionPage({ params }: { params: Promise<{ id: string; decision: string }> }) {
  const { id, decision } = await params;
  return <Decision projectId={id} slug={decision} />;
}
