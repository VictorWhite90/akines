import type { Metadata } from "next";
import Task from "@/components/collaborate/workspace/Task";

export const metadata: Metadata = { title: "Task · Akines" };

/** One task of a project. `task` is the slug of its title (lib/collab/tasks). */
export default async function Page({ params }: { params: Promise<{ id: string; task: string }> }) {
  const { id, task } = await params;
  return <Task projectId={id} slug={decodeURIComponent(task)} />;
}
