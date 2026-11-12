import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** Where Archive project ends: My projects, with the design's toast over it. */
export default function ProjectArchivedPage() {
  return <MyProjects toast="Project archived. You can restore it from My projects." />;
}
