"use client";

import { GAMES, type Game } from "@/lib/data/games";
import { useLocal } from "@/lib/useLocal";

/** Library games plus the ones the member created. */
export function useGames() {
  const [mine, setMine] = useLocal<Game[]>("ak:games", []);
  const all = [...mine, ...GAMES];
  const add = (g: Game) => setMine((cur) => [g, ...cur]);
  return { all, mine, add };
}
