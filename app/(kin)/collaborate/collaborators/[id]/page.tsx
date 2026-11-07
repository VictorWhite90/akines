import type { Metadata } from "next";
import Profile from "@/components/collaborate/collaborators/Profile";
import { allPeople } from "@/lib/data/people";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${allPeople.find((p) => p.id === id)?.name ?? "Collaborator"} · Akines` };
}

/** A recommended collaborator's profile. */
export default async function CollaboratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Profile id={id} />;
}
