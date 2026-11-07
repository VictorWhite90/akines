import type { Metadata } from "next";
import ProjectPage from "@/components/collaborate/projects/ProjectPage";

export const metadata: Metadata = { title: "Project · Akines" };

/** A project looking for people (an open call). Older links to a workspace here go on to My Projects. */
export default async function CollaborateProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectPage id={decodeURIComponent(id)} />;
}
