import type { Metadata } from "next";
import FileView from "@/components/collaborate/workspace/FileView";

export const metadata: Metadata = { title: "File · Akines" };

/** One file: preview, information, connected work and comments. */
export default async function Page({ params }: { params: Promise<{ id: string; file: string }> }) {
  const p = await params;
  return <FileView projectId={p.id} slug={p.file} />;
}
