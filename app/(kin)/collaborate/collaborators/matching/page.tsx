import type { Metadata } from "next";
import Matching from "@/components/collaborate/collaborators/Matching";

export const metadata: Metadata = { title: "Your collaboration intention · Akines" };

export default function MatchingPage() {
  return <Matching />;
}
