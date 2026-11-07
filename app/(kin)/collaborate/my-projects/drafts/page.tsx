import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** My Projects, open on Drafts: the Start a project builders you haven't finished. */
export default function DraftsPage() {
  return <MyProjects initialTab="drafts" />;
}
