import type { Metadata } from "next";
import { Suspense } from "react";
import MemberPage from "@/components/collaborate/projects/MemberPage";

export const metadata: Metadata = { title: "Member · Akines" };

/** A member of a project looking for people. ?project=<callId> names the project they are seen from. */
export default async function CollaborateMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <MemberPage id={decodeURIComponent(id)} />
    </Suspense>
  );
}
