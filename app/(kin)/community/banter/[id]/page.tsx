import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BanterIntro from "@/components/banter/BanterIntro";
import { BANTER_NOW } from "@/lib/data/banter";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = BANTER_NOW.find((x) => x.id === id);
  return { title: b ? `${b.topic} · Banter` : "Banter · Akines" };
}

/** One Banter conversation, in the design's Banter page. */
export default async function CommunityBanterSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = BANTER_NOW.find((x) => x.id === id);
  if (!session) notFound();
  return <BanterIntro session={session} />;
}
