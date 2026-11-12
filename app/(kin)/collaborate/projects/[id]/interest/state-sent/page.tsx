import type { Metadata } from "next";
import Interest from "@/components/collaborate/projects/Interest";

export const metadata: Metadata = { title: "Express interest · Akines" };

/** The design's Interest sent page, at its own address. */
export default async function InterestStateSentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Interest id={decodeURIComponent(id)} variant="sent" />;
}
