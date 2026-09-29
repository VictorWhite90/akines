"use client";

import { useLocal } from "@/lib/useLocal";
import { KINNECTIONS_KEY, SEED_KINNECTIONS } from "@/lib/data/relationships";
import type { PersonId } from "@/lib/data/people";

/** The member's Kinnections: relationships they've chosen to acknowledge. Shared across Discover, Messages and Profile. */
export function useKinnections() {
  const [ids, setIds, ready] = useLocal<PersonId[]>(KINNECTIONS_KEY, SEED_KINNECTIONS);
  const has = (id: PersonId) => ids.includes(id);
  const add = (id: PersonId) => setIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
  const remove = (id: PersonId) => setIds((cur) => cur.filter((x) => x !== id));
  const toggle = (id: PersonId) => (has(id) ? remove(id) : add(id));
  return { ids, has, add, remove, toggle, ready };
}
