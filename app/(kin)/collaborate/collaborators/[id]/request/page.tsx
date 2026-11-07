import type { Metadata } from "next";
import Request from "@/components/collaborate/collaborators/Request";

export const metadata: Metadata = { title: "Introduction request · Akines" };

export default async function CollaboratorRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Request id={id} />;
}
