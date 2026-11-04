"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/kin/Button";
import { Chip, Tag } from "@/components/kin/Chip";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { CIRCLES } from "@/lib/data/community";
import { MORE_POSTS } from "@/lib/data/feedMore";
import { REACTIONS, type Post, type ReactionKey } from "@/lib/data/feed";
import { ME, PEOPLE } from "@/lib/data/people";
import { FdAvatar, FdPhoto, photoSrc } from "./parts";

/** "Your circles' feed" on Community Home: the design's post cards, reading the shared feed store. */
const KEYS = Object.keys(REACTIONS) as ReactionKey[];

function ReactPicker({ onPick }: { onPick: (k: ReactionKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const focusBtn = () => ref.current?.querySelector<HTMLElement>(".fd-react__btn")?.focus();
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLElement>(".fd-pick__btn")?.focus();
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);
  return (
    <div className="fd-react" ref={ref}>
      <Chip className="fd-react__btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>+ React</Chip>
      {open ? (
        <div className="fd-pick" role="group" aria-label="Choose a reaction" onKeyDown={(e) => {
          const list = Array.from(ref.current?.querySelectorAll<HTMLElement>(".fd-pick__btn") ?? []);
          const at = list.indexOf(document.activeElement as HTMLElement);
          if (e.key === "Escape") { e.stopPropagation(); setOpen(false); focusBtn(); }
          else if (e.key === "ArrowRight" && list.length) { e.preventDefault(); list[(at + 1) % list.length].focus(); }
          else if (e.key === "ArrowLeft" && list.length) { e.preventDefault(); list[(at - 1 + list.length) % list.length].focus(); }
        }}>
          {KEYS.map((k) => <IconButton key={k} className="fd-pick__btn" label={`React: ${REACTIONS[k].label}`} tooltip={false} onClick={() => { onPick(k); setOpen(false); focusBtn(); }}><span className="fd-emoji" aria-hidden>{REACTIONS[k].glyph}</span></IconButton>)}
        </div>
      ) : null}
    </div>
  );
}

function FeedPost({ post }: { post: Post }) {
  const { react, myReaction } = usePosts();
  const author = PEOPLE[post.by];
  const circle = post.circle ? CIRCLES.find((c) => c.id === post.circle) : undefined;
  const mine = myReaction(post);
  const media = [...(post.photo ? [photoSrc(post.photo)] : []), ...(post.photos ?? [])].slice(0, 3);
  const used = KEYS.filter((k) => (post.reactions[k]?.length ?? 0) > 0);
  const replies = post.replies === 0 ? "No replies yet" : post.replies === 1 ? "1 reply" : `${post.replies} replies`;
  return (
    <article className="fd-post" aria-label={`Post by ${author.name}`}>
      <header className="fd-post__head">
        <FdAvatar id={post.by} size={48} />
        <div className="fd-post__who">
          <p className="fd-post__name">{author.name}</p>
          <p className="fd-post__meta">{author.role} · {author.city} · {post.at}</p>
        </div>
        {circle ? <Tag className="fd-post__circle">{circle.name}</Tag> : null}
      </header>
      <div className="fd-post__body">{post.text.split(/\n+/).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
      {media.length > 0 ? <div className={`fd-post__media fd-post__media--${media.length}`}>{media.map((m) => <FdPhoto key={m} src={m} className="fd-post__img" />)}</div> : null}
      <footer className="fd-post__foot">
        <div className="fd-post__reacts">
          {used.map((k) => {
            const n = post.reactions[k]?.length ?? 0;
            return <Chip key={k} selected={mine === k} count={n} aria-label={`${REACTIONS[k].label}, ${n}`} onClick={() => react(post, k)}><span className="fd-emoji" aria-hidden>{REACTIONS[k].glyph}</span></Chip>;
          })}
          <ReactPicker onPick={(k) => react(post, k)} />
        </div>
        <span className="fd-post__replies">{replies}</span>
      </footer>
    </article>
  );
}

export default function FeedPosts() {
  const { posts } = usePosts();
  const { ids } = useJoined();
  const feed = [...posts, ...MORE_POSTS].filter((p) => (p.circle ? ids.includes(p.circle) : p.by === ME.id)).slice(0, 3);
  return <div className="fd-posts" data-m="stagger">{feed.map((p) => <FeedPost key={p.id} post={p} />)}</div>;
}
