import type { Metadata } from "next";
import Interest from "@/components/collaborate/projects/Interest";

export const metadata: Metadata = { title: "Express interest · Akines" };

/** Express interest in a project: a role, the time you can give and a note for the owner. */
export default async function ExpressInterestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Interest id={decodeURIComponent(id)} />;
}
