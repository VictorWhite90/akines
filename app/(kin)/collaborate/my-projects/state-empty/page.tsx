import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** The design's Empty frame, at its own address. */
export default function MyProjectsEmptyPage() {
  return <MyProjects variant="empty" />;
}
