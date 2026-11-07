import type { Metadata } from "next";
import Member from "@/components/collaborate/workspace/Member";

export const metadata: Metadata = { title: "Team member · Akines" };

/** One team member: their work, availability, role, skills and contribution history. */
export default async function Page({ params }: { params: Promise<{ id: string; member: string }> }) {
  const p = await params;
  return <Member projectId={p.id} slug={p.member} />;
}
