import type { Metadata } from "next";
import { ExploreAll } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "Explore · Akines" };

/** Connect, Discover, Explore all. */
export default function ExplorePage() {
  return <ExploreAll />;
}
