import type { Metadata } from "next";
import Saved from "@/components/collaborate/projects/Saved";

export const metadata: Metadata = { title: "Saved projects · Akines" };

/** The design's Loading frame, at its own address: the skeleton, then the list. */
export default function SavedStateLoadingPage() {
  return <Saved variant="loading" />;
}
