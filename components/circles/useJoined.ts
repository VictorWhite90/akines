"use client";

import { CIRCLES } from "@/lib/data/community";
import { useLocal } from "@/lib/useLocal";

/** Which circles the member has joined (starts with the ones the seed data says they're in). */
export function useJoined() {
  const [ids, setIds] = useLocal<string[]>("ac:circles", CIRCLES.filter((c) => c.joined).map((c) => c.id));
  const toggle = (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
