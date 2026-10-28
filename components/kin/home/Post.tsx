"use client";

import Link from "next/link";
import { useState } from "react";
import { Export, Heart, Message } from "iconsax-reactjs";
import Avatar from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import Sheet from "@/components/kin/Sheet";
import { useComments } from "@/components/feed/useComments";
import { usePosts } from "@/components/feed/usePosts";
import { CIRCLES } from "@/lib/data/community";
import { REACTIONS, type Post as PostT, type ReactionKey } from "@/lib/data/feed";
import { ME, PEOPLE } from "@/lib/data/people";

const VERB: Partial<Record<PostT["type"], string>> = { ask: "asked", discuss: "started a discussion", invite: "invited people", help: "asked for help", collaborate: "is looking for collaborators" };
const KEYS = Object.keys(REACTIONS) as ReactionKey[];

/** One post: face, name, where and when, the words, the photo, then reply, react and share. No card. */
export default function Post({ post }: { post: PostT }) {
  const author = PEOPLE[post.by];
  const circle = post.circle ? CIRCLES.find((c) => c.id === post.circle) : undefined;
  const { react, myReaction } = usePosts();
  const { comments, count, add } = useComments(post.id);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(false);
  const [reply, setReply] = useState("");
  const mine = myReaction(post);
  const total = Object.values(post.reactions).reduce((n, ids) => n + (ids?.length ?? 0), 0);
  const images = (post.photos ?? []).slice(0, 2);
  const shots = Number(!!post.photo) + images.length;
  const verb = VERB[post.type];

  const share = async () => {
    const url = `${location.origin}/profile/${author.id}`;
    try { if (navigator.share) await navigator.share({ title: author.name, text: post.text, url }); else await navigator.clipboard.writeText(url); } catch {}
  };

  return (
    <article className="h-post">
      <Link href={`/profile/${author.id}`} aria-label={author.name}><Avatar person={author} size={40} /></Link>
      <div style={{ minWidth: 0 }}>
        <div className="h-post-head">
          <Link href={`/profile/${author.id}`}>{author.name}</Link>
          {verb && <span>{verb}</span>}
          <span>· {circle ? <Link href={`/circles/${circle.id}`}>{circle.name}</Link> : author.city} · {post.at}</span>
        </div>
        {post.text && <p className="h-post-body t-body">{post.text}</p>}
        {shots > 0 && (
          <div className={`h-post-media${shots > 1 ? " two" : ""}`}>
            {post.photo && <Media photo={post.photo} ratio={shots > 1 ? "1" : "4 / 3"} sizes="(max-width: 639px) 100vw, 600px" />}
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- a member's own upload, already shrunk
              <img key={i} src={src} alt="" className="up" />
            ))}
          </div>
        )}
        {post.type === "collaborate" && <Link href={post.collab ? `/collaborate/${post.collab}` : "/collaborate"} className="h-post-cta">I&apos;m interested</Link>}
        <div className="h-post-acts">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`${count} replies`}><Message size={18} color="currentColor" />{count > 0 && count}</button>
          <button type="button" onClick={() => react(post, mine ?? "appreciate")} aria-pressed={!!mine} aria-label={mine ? `You reacted: ${REACTIONS[mine].label}. Remove` : "Appreciate"}><Heart size={18} color="currentColor" variant={mine ? "Bold" : "Linear"} />{total > 0 && total}</button>
          <button type="button" onClick={() => setPick(true)} aria-label="React another way" className="t-small">{mine ? REACTIONS[mine].glyph : "+"}</button>
          <button type="button" onClick={share} aria-label="Share"><Export size={18} color="currentColor" /></button>
        </div>
      </div>
      {open && (
        <div className="h-replies">
          {comments.map((c) => (
            <div key={c.id} className="h-reply">
              <Avatar person={PEOPLE[c.by]} size={28} />
              <div><b>{PEOPLE[c.by].name}</b>{c.text}<small>{c.at}</small></div>
            </div>
          ))}
          <form className="h-reply-form" onSubmit={(e) => { e.preventDefault(); add(reply); setReply(""); }}>
            <Avatar person={ME} size={28} />
            <input className="k-input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${author.name.split(" ")[0]}`} aria-label="Write a reply" />
            <Button variant="primary" size="sm" type="submit" disabled={!reply.trim()}>Reply</Button>
          </form>
        </div>
      )}
      <Sheet open={pick} onClose={() => setPick(false)} title="React" sub="Say what this did for you, not just that you saw it.">
        <div className="h-reactions">
          {KEYS.map((k) => <button key={k} type="button" aria-pressed={mine === k} onClick={() => { react(post, k); setPick(false); }}><span aria-hidden>{REACTIONS[k].glyph}</span>{REACTIONS[k].label}</button>)}
        </div>
      </Sheet>
    </article>
  );
}
