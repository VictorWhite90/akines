import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgreementStage } from "@/components/collaborate/workspace/Agreements";

const STAGES = { intent: "Intent", contributions: "Contributions", ownership: "Ownership", revenue: "Revenue" } as const;
type Stage = keyof typeof STAGES;
const isStage = (s: string): s is Stage => s in STAGES;

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  return { title: `${isStage(stage) ? STAGES[stage] : "Agreements"} · Akines` };
}

/** Agreements, the other charter stages (intent, contributions, ownership, revenue), laid out as the roles page. */
export default async function AgreementStagePage({ params }: { params: Promise<{ id: string; stage: string }> }) {
  const { id, stage } = await params;
  if (!isStage(stage)) notFound();
  return <AgreementStage projectId={id} stage={stage} />;
}
