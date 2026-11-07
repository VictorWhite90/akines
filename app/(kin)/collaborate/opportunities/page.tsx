import type { Metadata } from "next";
import Opportunities from "@/components/collaborate/projects/Opportunities";

export const metadata: Metadata = { title: "Opportunities · Akines" };

/** Collaborate, Opportunities: open roles on projects looking for people, best match first. */
export default function OpportunitiesPage() {
  return <Opportunities />;
}
