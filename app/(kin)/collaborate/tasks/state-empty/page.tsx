import type { Metadata } from "next";
import { TasksList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Tasks · Akines" };

/** The design's empty state, at its own address. */
export default function TasksEmptyPage() {
  return <TasksList variant="empty" />;
}
