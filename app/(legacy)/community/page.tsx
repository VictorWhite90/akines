import type { Metadata } from "next";
import Weekly from "@/components/community/Weekly";

export const metadata: Metadata = { title: "The Akines Weekly" };

/** The community board as a weekly printed edition that ends. The previous board lives at /community/classic. */
export default function CommunityPage() {
  return <Weekly />;
}
