import type { Metadata } from "next";
import Profile from "@/components/collaborate/collaborators/Profile";

export const metadata: Metadata = { title: "Collaborator · Akines" };

/** The first recommendation's profile (the design's address); each person's is at /collaborators/<id>. */
export default function ProfilePreviewPage() {
  return <Profile />;
}
