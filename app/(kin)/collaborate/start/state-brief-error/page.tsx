import type { Metadata } from "next";
import { Suspense } from "react";
import StartProject from "@/components/collaborate/start/StartProject";

export const metadata: Metadata = { title: "Start a project · Akines" };

/** The design's Brief error frame: it has no trigger of its own, so it gets this address. */
export default function BriefErrorPage() {
  return (
    <Suspense>
      <StartProject initial="error" />
    </Suspense>
  );
}
