"use client";

import { useLocal, newId } from "@/lib/useLocal";
import { ME, type PersonId } from "@/lib/data/people";
import { commentsFor, type Comment } from "@/lib/data/comments";

type LocalComment = Comment & { id: string };
const KEY = "kn:comments";

/** Comments the member has written, layered on top of the seed replies for a post. Local-only, like the rest of the prototype's reactions. */
export function useComments(postId: string) {
  const [store, setStore] = useLocal<Record<string, LocalComment[]>>(KEY, {});
  const mine = store[postId] ?? [];
  const all = [...commentsFor(postId).map((c, i) => ({ ...c, id: `${postId}-seed-${i}` })), ...mine];

  const add = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const comment: LocalComment = { id: newId("c"), by: ME.id as PersonId, text: t, at: "Just now" };
    setStore((cur) => ({ ...cur, [postId]: [...(cur[postId] ?? []), comment] }));
  };

  return { comments: all, count: all.length, add };
}
