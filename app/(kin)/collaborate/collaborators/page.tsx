import type { Metadata } from "next";
import Entry from "@/components/collaborate/collaborators/Entry";

export const metadata: Metadata = { title: "Explore collaborators · Akines" };

/** Collaborate, Collaborators: the way in to finding people to work with. */
export default function CollaboratorsPage() {
  return <Entry />;
}
