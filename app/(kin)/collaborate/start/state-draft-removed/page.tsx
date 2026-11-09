import type { Metadata } from "next";
import { Suspense } from "react";
import StartProject from "@/components/collaborate/start/StartProject";

export const metadata: Metadata = { title: "Start a project · Akines" };

/** Review brief after Undo on "Draft saved": the draft is gone from My Projects, the brief is still here. */
export default function DraftRemovedPage() {
  return (
    <Suspense>
      <StartProject initial="review" draftRemoved />
    </Suspense>
  );
}
