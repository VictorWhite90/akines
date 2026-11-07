import type { Metadata } from "next";
import Saved from "@/components/collaborate/projects/Saved";

export const metadata: Metadata = { title: "Saved projects · Akines" };

/** Collaborate, the projects the member saved. */
export default function SavedProjectsPage() {
  return <Saved />;
}
