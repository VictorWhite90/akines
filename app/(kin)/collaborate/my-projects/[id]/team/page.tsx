import type { Metadata } from "next";
import Team from "@/components/collaborate/workspace/Team";

export const metadata: Metadata = { title: "Team · Akines" };

/** A project's team: members, interest requests and invitations. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  return <Team projectId={p.id} />;
}
