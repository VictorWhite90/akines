import type { Metadata } from "next";
import ProfilePage from "@/components/connect/Profile";
import { PEOPLE, type PersonId } from "@/lib/data/people";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${PEOPLE[decodeURIComponent(id) as PersonId]?.name ?? "Profile"} · Akines` };
}

/** Connect, People: a member's public profile. */
export default async function ConnectProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfilePage id={decodeURIComponent(id)} />;
}
