import type { Metadata } from "next";
import GameSetup from "@/components/play/GameSetup";
import { GAMES } from "@/lib/data/games";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const g = GAMES.find((x) => x.id === id);
  return { title: g ? `${g.name} · Play Together` : "Play Together · Akines" };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameSetup id={id} />;
}
