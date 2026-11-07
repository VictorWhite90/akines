import type { Metadata } from "next";
import MilestonePage from "@/components/collaborate/my-projects/milestone/Milestone";

export const metadata: Metadata = { title: "Milestone · Akines" };

/** One milestone of a project, inside its workspace. `milestone` is our Milestone id. */
export default async function Page({ params }: { params: Promise<{ id: string; milestone: string }> }) {
  const { id, milestone } = await params;
  return <MilestonePage id={id} milestone={decodeURIComponent(milestone)} />;
}
