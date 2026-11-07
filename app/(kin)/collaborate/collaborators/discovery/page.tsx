import type { Metadata } from "next";
import Discovery from "@/components/collaborate/collaborators/Discovery";

export const metadata: Metadata = { title: "Collaborators · Akines" };

/** People recommended to work with, each with the reason. */
export default function DiscoveryPage() {
  return <Discovery />;
}
