import type { Metadata } from "next";
import { Suspense } from "react";
import StartProject from "@/components/collaborate/start/StartProject";

export const metadata: Metadata = { title: "Start a project · Akines" };

/** Start a project, opened on the recommended Digital Art Workspace (the design's review state). */
export default function StartProjectPage() {
  return (
    <Suspense>
      <StartProject initial="workspace-art" />
    </Suspense>
  );
}
