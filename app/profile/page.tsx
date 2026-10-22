import type { Metadata } from "next";
import ProfilePage from "@/components/profile/ProfilePage";

export const metadata: Metadata = { title: "Your profile · Akines" };

export default function MyProfilePage() {
  return <ProfilePage />;
}
