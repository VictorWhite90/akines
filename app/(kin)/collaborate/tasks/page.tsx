import type { Metadata } from "next";
import { TasksList } from "@/components/collaborate/overview-lists/Lists";

export const metadata: Metadata = { title: "Tasks · Akines" };

/** Collaborate, Tasks due this week: across all the member's projects. */
export default function TasksPage() {
  return <TasksList />;
}
