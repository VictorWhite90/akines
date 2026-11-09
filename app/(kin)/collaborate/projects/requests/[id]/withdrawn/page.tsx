import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Interest withdrawn · Akines" };

/** You withdrew your interest. */
export default async function RequestWithdrawnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} view="withdrawn" />;
}
