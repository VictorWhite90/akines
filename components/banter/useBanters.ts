"use client";

import { BANTERS, type Banter, type BanterReply } from "@/lib/data/banter";
import { useLocal } from "@/lib/useLocal";

/** Seed Banters plus the ones the member started, newest first. Closed ones stay readable. */
export function useBanters() {
  const [mine, setMine] = useLocal<Banter[]>("ak:banters", []);
  const [closed, setClosed] = useLocal<string[]>("ak:banters-closed", []);
  const all = [...mine, ...BANTERS].map((b) => (closed.includes(b.id) ? { ...b, closed: true } : b));
  const add = (b: Banter) => setMine((cur) => [b, ...cur]);
  const close = (id: string) => setClosed((cur) => (cur.includes(id) ? cur : [...cur, id]));
  return { all, add, close };
}

/** Replies a member adds to any Banter, kept per Banter. */
export function useBanterReplies(id: string) {
  return useLocal<BanterReply[]>(`ak:banter-replies:${id}`, []);
}

/** Banters the member said “I want to explore this” about. */
export function useResonance() {
  const [ids, setIds] = useLocal<string[]>("ak:banter-resonate", []);
  const toggle = (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return { ids, toggle };
}

/** The member's poll choice per Banter (option index). */
export function usePollVotes() {
  const [votes, setVotes] = useLocal<Record<string, number>>("ak:banter-votes", {});
  const vote = (id: string, i: number) => setVotes((cur) => ({ ...cur, [id]: i }));
  return { votes, vote };
}
