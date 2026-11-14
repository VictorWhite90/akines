"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/kin/Button";
import { Chip, Tag } from "@/components/kin/Chip";
import { useLocal } from "@/lib/useLocal";
import { PICKER, POSTS, REACT_LABEL, type FeedPost } from "./content";
import { FdAvatar, FdPhoto } from "./parts";

/**
 * "Your circles' feed" on Community Home: the design's three posts (./content.ts) with reaction chips that toggle and
 * a "+ React" menu. Your reactions are kept in this browser.
 */
type ReactChip = { emoji: string; label: string; count: number; on: boolean };
type Reacts = Record<string, ReactChip[]>;
const INITIAL: Reacts = Object.fromEntries(POSTS.map((p) => [p.id, p.reactions.map((r) => ({ ...r, on: false }))]));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function ReactPicker({ onPick }: { onPick: (emoji: string, label: string) => void }) {
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
      <Chip className="fd-react__btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{REACT_LABEL}</Chip>
      {open ? (
        <div className="fd-pick" role="group" aria-label="Choose a reaction" onKeyDown={(e) => {
          const list = Array.from(ref.current?.querySelectorAll<HTMLElement>(".fd-pick__btn") ?? []);
          const at = list.indexOf(document.activeElement as HTMLElement);
          if (e.key === "Escape") { e.stopPropagation(); setOpen(false); focusBtn(); }
          else if (e.key === "ArrowRight" && list.length) { e.preventDefault(); list[(at + 1) % list.length].focus(); }
          else if (e.key === "ArrowLeft" && list.length) { e.preventDefault(); list[(at - 1 + list.length) % list.length].focus(); }
        }}>
          {PICKER.map((p) => <IconButton key={p.emoji} className="fd-pick__btn" label={`React with ${p.label}`} tooltip={false} onClick={() => { onPick(p.emoji, p.label); setOpen(false); focusBtn(); }}><span className="fd-emoji" aria-hidden>{p.emoji}</span></IconButton>)}
        </div>
      ) : null}
    </div>
  );
}

function Post({ post, chips, onToggle, onPick }: { post: FeedPost; chips: ReactChip[]; onToggle: (emoji: string) => void; onPick: (emoji: string, label: string) => void }) {
  const n = post.media.length;
  return (
    <article className="fd-post" aria-label={`Post by ${post.name}`}>
      <header className="fd-post__head">
        <FdAvatar src={post.face} size={48} />
        <div className="fd-post__who">
          <p className="fd-post__name">{post.name}</p>
          <p className="fd-post__meta">{post.meta}</p>
        </div>
        {post.circle ? <Tag className="fd-post__circle">{post.circle}</Tag> : null}
      </header>
      <div className="fd-post__body">{post.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
      {n > 0 ? <div className={`fd-post__media fd-post__media--${n}`}>{post.media.map((m) => <FdPhoto key={m} src={m} className="fd-post__img" sizes={n === 1 ? "(max-width: 767px) 100vw, 984px" : `(max-width: 767px) 72vw, ${Math.ceil(984 / n)}px`} />)}</div> : null}
      <footer className="fd-post__foot">
        <div className="fd-post__reacts">
          {chips.map((c) => <Chip key={c.emoji} selected={c.on} count={c.count} aria-label={`${cap(c.label)}, ${c.count}`} onClick={() => onToggle(c.emoji)}><span className="fd-emoji" aria-hidden>{c.emoji}</span></Chip>)}
          <ReactPicker onPick={onPick} />
        </div>
        <span className="fd-post__replies">{post.replies}</span>
      </footer>
    </article>
  );
}

export default function FeedPosts({ limit }: { limit?: number }) {
  const [reacts, setReacts] = useLocal<Reacts>("ak:feed-reactions", INITIAL);
  const flip = (c: ReactChip): ReactChip => ({ ...c, on: !c.on, count: c.count + (c.on ? -1 : 1) });
  const toggle = (id: string, emoji: string) => setReacts((prev) => ({ ...prev, [id]: (prev[id] ?? []).map((c) => (c.emoji === emoji ? flip(c) : c)) }));
  const pick = (id: string, emoji: string, label: string) =>
    setReacts((prev) => {
      const list = prev[id] ?? [];
      return list.some((c) => c.emoji === emoji)
        ? { ...prev, [id]: list.map((c) => (c.emoji === emoji ? flip(c) : c)) }
        : { ...prev, [id]: [...list, { emoji, label, count: 1, on: true }] };
    });
  const items = typeof limit === "number" ? POSTS.slice(0, limit) : POSTS;
  return (
    <div className="fd-posts" data-m="stagger">
      {items.map((p) => <Post key={p.id} post={p} chips={reacts[p.id] ?? INITIAL[p.id]} onToggle={(e) => toggle(p.id, e)} onPick={(e, l) => pick(p.id, e, l)} />)}
    </div>
  );
}
