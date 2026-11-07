import type { Metadata } from "next";
import RequestSent from "@/components/collaborate/collaborators/RequestSent";

export const metadata: Metadata = { title: "Request sent · Akines" };

export default async function CollaboratorRequestSentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestSent id={id} />;
}
