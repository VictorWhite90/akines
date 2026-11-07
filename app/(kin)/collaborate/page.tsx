import type { Metadata } from "next";
import CollaborateHome from "@/components/collaborate/home/Home";

export const metadata: Metadata = { title: "Collaborate · Akines" };

/** Collaborate, Home: your projects, what needs you, people to create with, invitations and open calls. */
export default function CollaboratePage() {
  return <CollaborateHome />;
}
