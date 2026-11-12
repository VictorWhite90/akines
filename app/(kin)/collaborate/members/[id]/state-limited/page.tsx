import type { Metadata } from "next";
import { Suspense } from "react";
import MemberPage from "@/components/collaborate/projects/MemberPage";

export const metadata: Metadata = { title: "Member · Akines" };

/** The design's Limited profile, at its own address. */
export default async function MemberPageStateLimitedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <MemberPage id={decodeURIComponent(id)} variant="limited" />
    </Suspense>
  );
}
