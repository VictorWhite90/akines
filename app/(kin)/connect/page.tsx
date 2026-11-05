import type { Metadata } from "next";
import { Suspense } from "react";
import Discover from "@/components/connect/Discover";

export const metadata: Metadata = { title: "Discover · Akines" };

/** Connect, Discover. ?filter=people|circles|projects|studio-visits|stories|events opens the mix on one kind. */
export default function DiscoverPage() {
  return (
    <Suspense>
      <Discover />
    </Suspense>
  );
}
