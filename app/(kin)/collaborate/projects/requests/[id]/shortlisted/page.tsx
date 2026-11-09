import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Your request · Akines" };

/** Your request once the host shortlisted you. */
export default async function RequestShortlistedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} view="shortlisted" />;
}
