"use client";

import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { CIRCLES } from "@/lib/data/community";
import { POST_TYPES, type Post } from "@/lib/data/feed";
import { PEOPLE } from "@/lib/data/people";
import CommentThread from "./CommentThread";
import { useComments } from "./useComments";
import ReactionBar from "./ReactionBar";

/** One post in the feed: typed (Share/Ask/Discuss/Invite/Help/Collaborate), with reactions instead of likes. */
export default function PostCard({ post, showContext = true }: { post: Post; showContext?: boolean }) {
  const author = PEOPLE[post.by];
  const t = POST_TYPES[post.type];
  const circle = post.circle ? CIRCLES.find((c) => c.id === post.circle) : undefined;
  const imageCount = Number(!!post.photo) + (post.photos?.length ?? 0);
  const multiImage = imageCount > 1;
  const { count } = useComments(post.id);
  const [open, setOpen] = useState(false);

  return (
    <article className={`kn-post type-${post.type}`}>
      <header>
        <Link href={`/profile/${author.id}`}><Avatar person={author} size={36} /></Link>
        <div className="who">
          <p><Link href={`/profile/${author.id}`}>{author.name}</Link> <span className={`type type-${post.type}`}><i aria-hidden>●</i>{t.label}</span></p>
          <p className="meta">
            {author.role} · {author.city} · {post.at}
            {showContext && circle && <> · <Link href={`/circles/${circle.id}`}>{circle.name}</Link></>}
            {showContext && post.collab && <> · <Link href={`/collaborate/${post.collab}`}>collaboration</Link></>}
          </p>
        </div>
      </header>
      {post.text && <p className="body">{post.text}</p>}
      {(post.photo || post.photos?.length) && (
        <div className={`photo${multiImage ? ` multi count-${imageCount}` : ""}`}>
          {post.photo && (multiImage ? <span><Pic name={post.photo} sizes="(max-width: 700px) 100vw, 600px" /></span> : <Pic name={post.photo} sizes="(max-width: 700px) 100vw, 600px" />)}
          {post.photos?.map((src, index) => (
            <span key={`${index}-${src.slice(0, 32)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- compressed local post image */}
              <img src={src} alt={`Post image ${index + 1}`} />
            </span>
          ))}
        </div>
      )}
      {post.type === "collaborate" && (
        <Link href={post.collab ? `/collaborate/${post.collab}` : "/collaborate"} className="im-in">I&apos;m interested →</Link>
      )}
      <footer>
        <ReactionBar post={post} />
        <button type="button" className="replies" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {count > 0 ? `💬 ${count} ${count === 1 ? "reply" : "replies"}` : "💬 Reply"}
        </button>
      </footer>
      {open && <CommentThread postId={post.id} />}
    </article>
  );
}
