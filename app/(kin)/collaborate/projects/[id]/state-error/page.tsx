import type { Metadata } from "next";
import ProjectPage from "@/components/collaborate/projects/ProjectPage";

export const metadata: Metadata = { title: "Project · Akines" };

/** The design's Could not load frame, at its own address. */
export default async function ProjectPageStateErrorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectPage id={decodeURIComponent(id)} variant="error" />;
}
