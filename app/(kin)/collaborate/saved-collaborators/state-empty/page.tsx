import type { Metadata } from "next";
import { SavedCollaborators } from "@/components/collaborate/collaborators/Lists";

export const metadata: Metadata = { title: "Saved collaborators · Akines" };

/** The design's empty state, at its own address. */
export default function SavedEmptyPage() {
  return <SavedCollaborators staticEmpty />;
}
