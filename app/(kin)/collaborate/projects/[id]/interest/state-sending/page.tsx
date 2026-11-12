import type { Metadata } from "next";
import Interest from "@/components/collaborate/projects/Interest";

export const metadata: Metadata = { title: "Express interest · Akines" };

/** The design's Sending frame, at its own address: it then goes on to Interest sent without sending. */
export default async function InterestStateSendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Interest id={decodeURIComponent(id)} variant="sending" />;
}
