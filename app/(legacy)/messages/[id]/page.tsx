import type { Metadata } from "next";
import Messages from "@/components/messages/Messages";

export const metadata: Metadata = { title: "Messages | Akines" };

/** /messages/[id] opens a conversation by id (people link here with their person id). */
export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Messages initial={id} />;
}
