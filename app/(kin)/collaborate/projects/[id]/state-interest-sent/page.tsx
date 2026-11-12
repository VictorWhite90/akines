import type { Metadata } from "next";
import ProjectPage from "@/components/collaborate/projects/ProjectPage";

export const metadata: Metadata = { title: "Project · Akines" };

/** The project with interest sent (the side panel shows the request), at its own address. */
export default async function ProjectPageStateSentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectPage id={decodeURIComponent(id)} variant="sent" />;
}
