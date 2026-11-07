import type { Metadata } from "next";
import Tasks from "@/components/collaborate/workspace/Tasks";

export const metadata: Metadata = { title: "Tasks · Akines" };

/** A project's tasks (milestones). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Tasks projectId={id} view="milestones" />;
}
