import type { Metadata } from "next";
import { FormalAgreement } from "@/components/collaborate/workspace/Agreements";

export const metadata: Metadata = { title: "Formal Agreement · Akines" };

/** Agreements, stage 06: the optional formal agreement. */
export default async function FormalAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormalAgreement projectId={id} />;
}
