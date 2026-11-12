import type { Metadata } from "next";
import ProjectPage from "@/components/collaborate/projects/ProjectPage";

export const metadata: Metadata = { title: "Project · Akines" };

/** The design's No longer open frame, at its own address. */
export default async function ProjectPageStateClosedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectPage id={decodeURIComponent(id)} variant="closed" />;
}
