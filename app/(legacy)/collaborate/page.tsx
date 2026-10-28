import type { Metadata } from "next";
import Hub from "@/components/collab/Hub";

export const metadata: Metadata = { title: "Collaborate · Akines" };

export default function CollaboratePage() {
  return <Hub />;
}
