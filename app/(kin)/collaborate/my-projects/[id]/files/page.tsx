import type { Metadata } from "next";
import Files from "@/components/collaborate/workspace/Files";

export const metadata: Metadata = { title: "Files · Akines" };

/** A project's files: studio, proof of work and documents the team adds. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  return <Files projectId={p.id} />;
}
