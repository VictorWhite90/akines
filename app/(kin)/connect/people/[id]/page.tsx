import type { Metadata } from "next";
import ProfilePage from "@/components/connect/Profile";
import { profileOf } from "@/lib/connect/profiles";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${profileOf(decodeURIComponent(id))?.name ?? "Profile"} · Akines` };
}

/** Connect, People: a member's public profile. */
export default async function ConnectProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfilePage id={decodeURIComponent(id)} />;
}
