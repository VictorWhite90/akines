import type { Metadata } from "next";
import ProfilePage from "@/components/connect/Profile";

export const metadata: Metadata = { title: "Profile · Akines" };

/** The design's profile error state, at its own address. */
export default function ProfileErrorPage() {
  return <ProfilePage state="error" />;
}
