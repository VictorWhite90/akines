import type { Metadata } from "next";
import { HomeLoadingState } from "@/components/collaborate/home/Home";

export const metadata: Metadata = { title: "Collaborate · Akines" };

/** The design's loading Home, at its own address: the skeleton, then Home. */
export default function CollaborateLoadingPage() {
  return <HomeLoadingState />;
}
