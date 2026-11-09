import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Pick a time · Akines" };

/** Pick a time to talk with the host. */
export default async function RequestPickTimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} view="time" />;
}
