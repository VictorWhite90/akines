import type { Metadata } from "next";
import Link from "next/link";
import GameCircle from "@/components/play/GameCircle";
import { GAME_SESSIONS, GAMES } from "@/lib/data/games";

export const metadata: Metadata = { title: "Game Circle · Akines" };

export default async function GameSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = GAME_SESSIONS.find((s) => s.id === id);
  const game = session && GAMES.find((g) => g.id === session.game);
  if (!session || !game) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-display text-[26px]">This game night has finished.</p>
        <Link href="/play" className="mt-6 inline-block rounded-full bg-night px-6 py-3 text-[14px] font-semibold text-white">Back to Play Together</Link>
      </div>
    );
  }
  return <GameCircle game={game} title={session.title} players={session.players} mode={session.mode} />;
}
