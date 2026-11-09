import type { Metadata } from "next";
import { InterestPage } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "Interest · Akines" };

/** The design's No results state of an interest (Projects on), at its own address. */
export default async function InterestNoResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InterestPage id={decodeURIComponent(id)} initial="projects" empty />;
}
