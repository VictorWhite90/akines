import type { Metadata } from "next";
import { AgreementStage } from "@/components/collaborate/workspace/Agreements";

export const metadata: Metadata = { title: "Roles · Akines" };

/** Agreements, stage 02: roles and responsibilities. */
export default async function RolesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgreementStage projectId={id} stage="roles" />;
}
