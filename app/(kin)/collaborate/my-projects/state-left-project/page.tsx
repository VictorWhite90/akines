import type { Metadata } from "next";
import MyProjects from "@/components/collaborate/my-projects/MyProjects";

export const metadata: Metadata = { title: "My Projects · Akines" };

/** Where Leave project ends: My projects, with the design's toast over it. */
export default function LeftProjectPage() {
  return <MyProjects toast="You left the project." />;
}
