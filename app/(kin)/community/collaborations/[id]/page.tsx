import type { Metadata } from "next";
import Collaboration from "@/components/community/Collaboration";

export const metadata: Metadata = { title: "Collaboration · Akines" };

export default async function CollaborationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Collaboration id={id} />;
}
