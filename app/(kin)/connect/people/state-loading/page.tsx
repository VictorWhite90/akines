import type { Metadata } from "next";
import ProfilePage from "@/components/connect/Profile";

export const metadata: Metadata = { title: "Profile · Akines" };

/** The design's profile loading state, at its own address. */
export default function ProfileLoadingPage() {
  return <ProfilePage state="loading" />;
}
