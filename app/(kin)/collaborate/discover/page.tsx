import type { Metadata } from "next";
import Discover from "@/components/collaborate/projects/Discover";

export const metadata: Metadata = { title: "Discover projects · Akines" };

/** Collaborate, Discover Projects: open calls looking for people, searchable and filterable. */
export default function DiscoverProjectsPage() {
  return <Discover />;
}
