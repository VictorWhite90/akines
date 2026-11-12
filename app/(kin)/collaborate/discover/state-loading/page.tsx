import type { Metadata } from "next";
import Discover from "@/components/collaborate/projects/Discover";

export const metadata: Metadata = { title: "Discover projects · Akines" };

/** The design's Loading frame, at its own address: the skeleton, then the projects. */
export default function DiscoverStateLoadingPage() {
  return <Discover variant="loading" />;
}
