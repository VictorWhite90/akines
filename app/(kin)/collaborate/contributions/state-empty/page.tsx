import type { Metadata } from "next";
import Contributions from "@/components/collaborate/projects/Contributions";

export const metadata: Metadata = { title: "My contributions · Akines" };

/** The design's Empty frame, at its own address. */
export default function ContributionsEmptyPage() {
  return <Contributions variant="empty" />;
}
