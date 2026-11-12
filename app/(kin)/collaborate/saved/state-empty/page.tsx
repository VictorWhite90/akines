import type { Metadata } from "next";
import Saved from "@/components/collaborate/projects/Saved";

export const metadata: Metadata = { title: "Saved projects · Akines" };

/** The design's Empty frame, at its own address. */
export default function SavedStateEmptyPage() {
  return <Saved variant="empty" />;
}
