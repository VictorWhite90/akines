import type { Metadata } from "next";
import Agreements from "@/components/collaborate/workspace/Agreements";

export const metadata: Metadata = { title: "Agreements · Akines" };

/** A project's agreements: the six stages. */
export default async function AgreementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Agreements projectId={id} />;
}
