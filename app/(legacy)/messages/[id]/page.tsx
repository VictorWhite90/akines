import type { Metadata } from "next";
import KinMessage from "@/components/messages/KinMessage";

export const metadata: Metadata = { title: "KinMessage · Akines" };

/** /messages/[id] opens a conversation by id (people link here with their person id). */
export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KinMessage initial={id} />;
}
