import type { Metadata } from "next";
import { RequestState } from "@/components/collaborate/collaborators/RequestStatus";

export const metadata: Metadata = { title: "Introduction request · Akines" };

/** Review address: the request's Loading frame, then the request. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestState id={id} initial="loading" />;
}
