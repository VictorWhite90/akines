import type { Metadata } from "next";
import RequestStatus from "@/components/collaborate/collaborators/RequestStatus";

export const metadata: Metadata = { title: "Introduction request · Akines" };

/** The design's Not now page of a request (the address its row links to once they replied). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestStatus id={id} stage="notnow" />;
}
