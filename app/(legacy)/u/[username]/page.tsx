import type { Metadata } from "next";
import ProfilePage from "@/components/profile/ProfilePage";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)} · Akines` };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfilePage username={decodeURIComponent(username).replace(/^@/, "")} />;
}
