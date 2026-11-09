import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Talk booked · Akines" };

/** Your talk with the host is booked. */
export default async function RequestTalkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} view="talk" />;
}
