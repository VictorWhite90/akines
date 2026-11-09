import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Offer declined · Akines" };

/** You declined the offer. */
export default async function RequestDeclinedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} view="declined" />;
}
