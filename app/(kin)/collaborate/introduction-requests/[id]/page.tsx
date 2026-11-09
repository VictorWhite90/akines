import type { Metadata } from "next";
import RequestStatus from "@/components/collaborate/collaborators/RequestStatus";

export const metadata: Metadata = { title: "Introduction request · Akines" };

/** The introduction request you sent to this person, at its own status. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestStatus id={id} />;
}
