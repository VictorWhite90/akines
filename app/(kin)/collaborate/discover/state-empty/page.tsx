import type { Metadata } from "next";
import Discover from "@/components/collaborate/projects/Discover";

export const metadata: Metadata = { title: "Discover projects · Akines" };

/** The design's "No projects yet" frame, at its own address. */
export default function DiscoverStateEmptyPage() {
  return <Discover variant="empty" />;
}
