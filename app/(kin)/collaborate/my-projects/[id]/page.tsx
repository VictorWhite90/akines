import type { Metadata } from "next";
import Overview from "@/components/collaborate/workspace/Overview";

export const metadata: Metadata = { title: "Project overview · Akines" };

/** A project's workspace: the overview. */
export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Overview projectId={id} />;
}
