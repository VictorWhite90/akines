import type { Metadata } from "next";
import { Suspense } from "react";
import Discover from "@/components/connect/Discover";

export const metadata: Metadata = { title: "Discover · Akines" };

/** The design's empty state of Discover, at its own address. */
export default function DiscoverEmptyPage() {
  return (
    <Suspense>
      <Discover state="empty" />
    </Suspense>
  );
}
