"use client";

import { useLocal, newId } from "@/lib/useLocal";
import { ME, type PersonId } from "@/lib/data/people";
import { POSTS, type Post, type PostType, type ReactionKey } from "@/lib/data/feed";
import type { PhotoKey } from "@/lib/data/images";

const POSTS_KEY = "kn:posts";
const REACTIONS_KEY = "kn:reactions";
type ReactionOverlay = Record<string, Partial<Record<ReactionKey, boolean>>>;

/**
 * The shared feed store: Home, a Circle's Feed tab and a profile's "My World" all read from this,
 * so a post made anywhere shows up everywhere it should. Seed posts are static; anything a member
 * writes or reacts to lives in localStorage on top of them.
 */
export function usePosts() {
  const [mine, setMine] = useLocal<Post[]>(POSTS_KEY, []);
  const [overlay, setOverlay] = useLocal<ReactionOverlay>(REACTIONS_KEY, {});
  const me = ME.id as PersonId;

  const withReactions = (p: Post): Post => {
    const over = overlay[p.id];
    if (!over) return p;
    const reactions = { ...p.reactions };
    (Object.keys(over) as ReactionKey[]).forEach((key) => {
      const want = over[key];
      const cur = reactions[key] ?? [];
      const has = cur.includes(me);
      if (want && !has) reactions[key] = [...cur, me];
      else if (!want && has) reactions[key] = cur.filter((x) => x !== me);
    });
    return { ...p, reactions };
  };

  const all = [...mine, ...POSTS].map(withReactions).sort((a, b) => (a.at === b.at ? 0 : mine.some((m) => m.id === a.id) ? -1 : mine.some((m) => m.id === b.id) ? 1 : 0));

  const addPost = (input: { type: PostType; text: string; photo?: PhotoKey; photos?: string[]; circle?: string; collab?: string }) => {
    const post: Post = { id: newId("post"), by: me, type: input.type, text: input.text.trim(), photo: input.photo, photos: input.photos, circle: input.circle, collab: input.collab, at: "Just now", reactions: {}, replies: 0 };
    setMine((cur) => [post, ...cur]);
    return post;
  };

  const myReaction = (post: Post): ReactionKey | null => {
    const entry = (Object.entries(post.reactions) as [ReactionKey, PersonId[] | undefined][]).find(([, ids]) => ids?.includes(me));
    return entry ? entry[0] : null;
  };

  const react = (post: Post, key: ReactionKey) => {
    const current = myReaction(post);
    setOverlay((cur) => {
      const next = { ...cur, [post.id]: { ...cur[post.id] } };
      if (current) next[post.id]![current] = false;
      if (current !== key) next[post.id]![key] = true;
      return next;
    });
  };

  return { posts: all, addPost, react, myReaction, forCircle: (circleId: string) => all.filter((p) => p.circle === circleId), byPerson: (id: PersonId) => all.filter((p) => p.by === id) };
}
