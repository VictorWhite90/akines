import type { Metadata } from "next";
import ApplyFlow from "@/components/collab/ApplyFlow";
import { SEED_CALLS } from "@/lib/collab/seed";

export const metadata: Metadata = { title: "Apply · Akines" };

export function generateStaticParams() {
  return SEED_CALLS.map((c) => ({ id: c.id }));
}

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplyFlow key={id} id={id} />;
}
