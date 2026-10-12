import type { Metadata } from "next";
import BanterThread from "@/components/banter/BanterThread";
import { BANTERS } from "@/lib/data/banter";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = BANTERS.find((x) => x.id === id);
  return { title: b ? `${b.prompt.slice(0, 50)} · Banter` : "Banter · Akines" };
}

export default async function BanterThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BanterThread id={id} />;
}
