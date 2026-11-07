import type { Metadata } from "next";
import WhyMatch from "@/components/collaborate/collaborators/WhyMatch";

export const metadata: Metadata = { title: "Why this match · Akines" };

export default async function CollaboratorWhyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WhyMatch id={id} />;
}
