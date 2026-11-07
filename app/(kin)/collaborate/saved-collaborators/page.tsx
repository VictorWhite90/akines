import type { Metadata } from "next";
import { SavedCollaborators } from "@/components/collaborate/collaborators/Lists";

export const metadata: Metadata = { title: "Saved collaborators · Akines" };

export default function SavedCollaboratorsPage() {
  return <SavedCollaborators />;
}
