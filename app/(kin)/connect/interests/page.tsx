import type { Metadata } from "next";
import { AllInterests } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "Explore by interest · Akines" };

/** Connect, Discover, All interests. */
export default function InterestsPage() {
  return <AllInterests />;
}
