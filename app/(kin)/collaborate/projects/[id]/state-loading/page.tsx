import type { Metadata } from "next";
import ProjectPage from "@/components/collaborate/projects/ProjectPage";

export const metadata: Metadata = { title: "Project · Akines" };

/** The design's Loading frame, at its own address: the skeleton, then the project. */
export default async function ProjectPageStateLoadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectPage id={decodeURIComponent(id)} variant="loading" />;
}
