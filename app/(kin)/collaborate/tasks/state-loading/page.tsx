import type { Metadata } from "next";
import { TasksList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Tasks · Akines" };

/** The design's loading state, at its own address: the skeleton, then the list. */
export default function TasksLoadingPage() {
  return <TasksList variant="loading" />;
}
