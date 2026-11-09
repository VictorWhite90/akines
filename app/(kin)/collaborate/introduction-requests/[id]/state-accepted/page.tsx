import type { Metadata } from "next";
import RequestStatus from "@/components/collaborate/collaborators/RequestStatus";

export const metadata: Metadata = { title: "Introduction request · Akines" };

/** Review address: the request as Accepted. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestStatus id={id} stage="accepted" />;
}
