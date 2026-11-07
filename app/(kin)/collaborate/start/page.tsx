import type { Metadata } from "next";
import { Suspense } from "react";
import StartProject from "@/components/collaborate/start/StartProject";

export const metadata: Metadata = { title: "Start a project · Akines" };

/** Collaborate, Start a project: the builder. ?draft=<id> resumes a draft. */
export default function StartProjectPage() {
  return (
    <Suspense>
      <StartProject />
    </Suspense>
  );
}
