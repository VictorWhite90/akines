"use client";

import Link from "next/link";
import { useState } from "react";
import { Share } from "lucide-react";
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

/** One post on a white card: who, where and when, the words, the photos, reactions with counts, replies. */
export default function Post({ post }: { post: PostT }) {
  const author = PEOPLE[post.by];
  const circle = post.circle ? CIRCLES.find((c) => c.id === post.circle) : undefined;
  const { react, myReaction } = usePosts();
  const { comments, count, add } = useComments(post.id);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(false);
  const [reply, setReply] = useState("");
  const mine = myReaction(post);
  const used = KEYS.filter((k) => (post.reactions[k]?.length ?? 0) > 0);
  const images = (post.photos ?? []).slice(0, 3);
  const shots = Number(!!post.photo) + images.length;
  const verb = VERB[post.type];

  const share = async () => {
    const url = `${location.origin}/profile/${author.id}`;
    try { if (navigator.share) await navigator.share({ title: author.name, text: post.text, url }); else await navigator.clipboard.writeText(url); } catch {}
  };

  return (
    <article className="h-post">
      <header className="h-post-head">
        <Link href={`/profile/${author.id}`} aria-label={author.name}><Avatar person={author} size={48} /></Link>
        <div className="who">
          <Link href={`/profile/${author.id}`} className="name">{author.name}</Link>{verb && <span className="verb"> {verb}</span>}
          <span className="meta">{author.role} · {author.city} · {post.at}</span>
        </div>
        {circle && <Link href={`/circles/${circle.id}`} className="h-post-circle">{circle.name}</Link>}
      </header>
      {post.text && <p className="h-post-body">{post.text}</p>}
      {shots > 0 && (
        <div className="h-post-media" data-n={Math.min(shots, 3)}>
          {post.photo && <Media photo={post.photo} ratio={shots > 1 ? "5 / 4" : "16 / 10"} sizes="(max-width: 639px) 100vw, 840px" />}
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- a member's own upload, already shrunk
            <img key={i} src={src} alt="" className="up" />
          ))}
        </div>
      )}
      {post.type === "collaborate" && <div><Button variant="secondary" size="sm" href={post.collab ? `/collaborate/${post.collab}` : "/collaborate"} arrow="right">I&apos;m interested</Button></div>}
      <footer className="h-post-acts">
        <div className="pills">
          {used.map((k) => {
            const n = post.reactions[k]?.length ?? 0;
            return (
              <button key={k} type="button" className="h-pill" aria-pressed={mine === k} onClick={() => react(post, k)} aria-label={`${REACTIONS[k].label}, ${n}${mine === k ? ". You reacted. Remove" : ""}`}>
                <span aria-hidden>{REACTIONS[k].glyph}</span><span className="n">{n}</span>
              </button>
            );
          })}
          <button type="button" className="h-pill" onClick={() => setPick(true)} aria-haspopup="dialog">+ React</button>
          <button type="button" className="h-pill icon" onClick={share} aria-label="Share"><Share size={16} strokeWidth={1.5} aria-hidden /></button>
        </div>
        <button type="button" className="h-replies-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`}</button>
      </footer>
      {open && (
        <div className="h-replies">
          {comments.map((c) => (
            <div key={c.id} className="h-reply">
              <Avatar person={PEOPLE[c.by]} size={32} />
              <div><b>{PEOPLE[c.by].name}</b>{c.text}<small>{c.at}</small></div>
            </div>
          ))}
          <form className="h-reply-form" onSubmit={(e) => { e.preventDefault(); add(reply); setReply(""); }}>
            <Avatar person={ME} size={32} />
            <input className="k-input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${author.name.split(" ")[0]}`} aria-label="Write a reply" />
            <Button variant="primary" size="sm" type="submit" disabled={!reply.trim()}>Reply</Button>
          </form>
        </div>
      )}
      <Sheet open={pick} onClose={() => setPick(false)} title="React" sub="Say what this did for you, not just that you saw it.">
        <div className="h-reactions">
          {KEYS.map((k) => <button key={k} type="button" className="k-chip" aria-pressed={mine === k} onClick={() => { react(post, k); setPick(false); }}><span aria-hidden>{REACTIONS[k].glyph}</span>{REACTIONS[k].label}</button>)}
        </div>
      </Sheet>
    </article>
  );
}
