import type { Metadata } from "next";
import Contributions from "@/components/collaborate/projects/Contributions";

export const metadata: Metadata = { title: "My contributions · Akines" };

/** Collaborate, My Contributions: a record of the member's work with others. */
export default function ContributionsPage() {
  return <Contributions />;
}
