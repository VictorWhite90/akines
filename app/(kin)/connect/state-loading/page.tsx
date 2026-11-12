import type { Metadata } from "next";
import { Suspense } from "react";
import Discover from "@/components/connect/Discover";

export const metadata: Metadata = { title: "Discover · Akines" };

/** The design's loading state of Discover, at its own address. */
export default function DiscoverLoadingPage() {
  return (
    <Suspense>
      <Discover state="loading" />
    </Suspense>
  );
}
