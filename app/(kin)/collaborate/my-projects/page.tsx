import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** Collaborate, My Projects: the projects you host or belong to. */
export default function MyProjectsPage() {
  return <MyProjects />;
}
