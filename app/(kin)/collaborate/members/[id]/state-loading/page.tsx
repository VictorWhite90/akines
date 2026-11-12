import type { Metadata } from "next";
import { Suspense } from "react";
import MemberPage from "@/components/collaborate/projects/MemberPage";

export const metadata: Metadata = { title: "Member · Akines" };

/** The design's Loading frame, at its own address: the skeleton, then the profile. */
export default async function MemberPageStateLoadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <MemberPage id={decodeURIComponent(id)} variant="loading" />
    </Suspense>
  );
}
