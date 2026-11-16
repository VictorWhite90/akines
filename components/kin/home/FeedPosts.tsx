"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import { IconButton } from "@/components/kin/Button";
import { Chip, Tag } from "@/components/kin/Chip";
import { toast } from "@/components/kin/Toast";
import { SOON, soon } from "@/lib/soon";
import { useLocal } from "@/lib/useLocal";
import { MORE_POSTS, PICKER, POSTS, REACT_LABEL, type FeedPost } from "./content";
import { Carousel, SlidePhoto } from "./Carousel";
import { FdAvatar, FdPhoto } from "./parts";

/**
 * "Your circles' feed" on Community Home: the design's three posts (./content.ts) with reaction chips that toggle and
 * a "+ React" menu. Your reactions are kept in this browser.
 */
type ReactChip = { emoji: string; label: string; count: number; on: boolean };
type Reacts = Record<string, ReactChip[]>;
const INITIAL: Reacts = Object.fromEntries([...POSTS, ...MORE_POSTS].map((p) => [p.id, p.reactions.map((r) => ({ ...r, on: false }))]));
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

/** The post's "…" menu (desktop posts): open the circle it was shared in, or copy a link to the post. */
function PostMenu({ post }: { post: FeedPost }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLElement>(".ig-menu__item")?.focus();
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); ref.current?.querySelector<HTMLElement>(".ig-more")?.focus(); } };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const copy = () => {
    setOpen(false);
    const url = `${window.location.origin}/#post-${post.id}`;
    void navigator.clipboard?.writeText(url).then(() => toast.show({ message: "Link copied" }), () => toast.show({ message: "Could not copy the link" }));
  };
  return (
    <div className="ig-menu" ref={ref}>
      <button type="button" className="ig-more" aria-label={`More about ${post.name}'s post`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><Ellipsis size={20} strokeWidth={1.5} aria-hidden /></button>
      {open ? (
        <div className="ig-menu__pop" role="menu">
          {post.circle ? <Link role="menuitem" className="ig-menu__item" href={soon(SOON.kincircle, post.circle)} onClick={() => setOpen(false)}>Go to {post.circle}</Link> : null}
          <button type="button" role="menuitem" className="ig-menu__item" onClick={copy}>Copy link</button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Desktop (1280 and up): the post as Instagram lays one out. Author row (face, name and time, the circle or their work
 * and place under it, and a "…" menu), the photos as a carousel, the reactions, then the words with "more".
 */
function PostCard({ post, chips, onToggle, onPick }: { post: FeedPost; chips: ReactChip[]; onToggle: (emoji: string) => void; onPick: (emoji: string, label: string) => void }) {
  const [i, setI] = useState(0);
  const [more, setMore] = useState(false);
  const parts = post.meta.split(" · ");
  const time = parts.length > 1 ? parts[parts.length - 1] : "";
  const work = parts.slice(0, parts.length > 1 ? -1 : undefined).join(" · ");
  const text = post.body.join(" ");
  const long = post.body.length > 1 || text.length > 140;
  const n = post.media.length;
  return (
    <article className="ig-post ig-post--member" id={`post-${post.id}`} aria-label={`Post by ${post.name}`} data-m="up">
      <header className="ig-head">
        <span className="ig-ring"><FdAvatar src={post.face} size={36} /></span>
        <div className="ig-head__who">
          <p className="ig-head__name"><span>{post.name}</span>{time ? <span className="ig-head__time"> · {time}</span> : null}</p>
          <p className="ig-head__ctx" title={post.meta}>{post.circle ?? work}</p>
        </div>
        <PostMenu post={post} />
      </header>
      {n > 0 ? (
        <Carousel
          label={`Photos from ${post.name}`}
          index={i}
          onIndex={setI}
          ratio="4 / 5"
          slides={post.media.map((m, k) => ({ key: m, label: `Photo ${k + 1}`, node: <SlidePhoto src={m} /> }))}
        />
      ) : null}
      <div className="ig-actions">
        <div className="fd-post__reacts">
          {chips.map((c) => <Chip key={c.emoji} selected={c.on} count={c.count} aria-label={`${cap(c.label)}, ${c.count}`} onClick={() => onToggle(c.emoji)}><span className="fd-emoji" aria-hidden>{c.emoji}</span></Chip>)}
          <ReactPicker onPick={onPick} />
        </div>
        <span className="ig-actions__replies">{post.replies}</span>
      </div>
      <div className={n === 0 ? "ig-words ig-words--only" : "ig-words"} data-open={more || !long ? "true" : "false"}>
        <div className="ig-words__text">
          {post.body.map((p, k) => <p key={p.slice(0, 24)}>{k === 0 ? <b className="ig-words__name">{post.name}</b> : null}{k === 0 ? " " : null}{p}</p>)}
        </div>
        {long && !more ? <button type="button" className="ig-words__more" onClick={() => setMore(true)} aria-label={`More of ${post.name}'s post`}>more</button> : null}
      </div>
    </article>
  );
}

export default function FeedPosts({ limit, variant, posts }: { limit?: number; variant?: "post"; posts?: FeedPost[] }) {
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
  const list = posts ?? POSTS;
  const items = typeof limit === "number" ? list.slice(0, limit) : list;
  if (variant === "post") {
    return (
      <div className="ig-posts">
        {items.map((p) => <PostCard key={p.id} post={p} chips={reacts[p.id] ?? INITIAL[p.id]} onToggle={(e) => toggle(p.id, e)} onPick={(e, l) => pick(p.id, e, l)} />)}
      </div>
    );
  }
  return (
    <div className="fd-posts" data-m="stagger">
      {items.map((p) => <Post key={p.id} post={p} chips={reacts[p.id] ?? INITIAL[p.id]} onToggle={(e) => toggle(p.id, e)} onPick={(e, l) => pick(p.id, e, l)} />)}
    </div>
  );
}
