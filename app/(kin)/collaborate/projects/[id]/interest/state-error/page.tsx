import type { Metadata } from "next";
import Interest from "@/components/collaborate/projects/Interest";

export const metadata: Metadata = { title: "Express interest · Akines" };

/** The design's Could not send frame, at its own address. */
export default async function InterestStateErrorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Interest id={decodeURIComponent(id)} variant="error" />;
}
