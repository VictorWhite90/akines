import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** The design's Loading frame, at its own address: the skeleton, then the list. */
export default function MyProjectsLoadingPage() {
  return <MyProjects variant="loading" />;
}
