import type { Metadata } from "next";
import Collaboration from "@/components/community/Collaboration";

export const metadata: Metadata = { title: "Collaboration · Akines" };

/** Your most recent collaboration; /community/collaborations/<project id> opens a particular one. */
export default function CollaborationsPage() {
  return <Collaboration />;
}
