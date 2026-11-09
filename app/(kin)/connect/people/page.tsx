import type { Metadata } from "next";
import ProfilePage from "@/components/connect/Profile";

export const metadata: Metadata = { title: "Profile · Akines" };

/** The design's address for the profile frames opens Loading, as theirs does. */
export default function PeoplePage() {
  return <ProfilePage state="loading" />;
}
