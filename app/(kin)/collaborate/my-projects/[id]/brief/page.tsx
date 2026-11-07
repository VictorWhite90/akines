import type { Metadata } from "next";
import Brief from "@/components/collaborate/my-projects/brief/Brief";

export const metadata: Metadata = { title: "Project brief · Akines" };

/** A project's shared brief, inside its workspace. */
export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Brief id={id} />;
}
