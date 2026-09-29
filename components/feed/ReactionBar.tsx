"use client";

import { useState } from "react";
import { REACTIONS, type Post, type ReactionKey } from "@/lib/data/feed";
import { usePosts } from "./usePosts";

/**
 * Kinnect's reactions, section 9 of the brief: a gateway to human interaction, not a popularity count.
 * Shows the top two or three reactions with their counts, and a picker for the rest.
 */
export default function ReactionBar({ post }: { post: Post }) {
  const { react, myReaction } = usePosts();
  const [open, setOpen] = useState(false);
  const mine = myReaction(post);
  const entries = (Object.entries(post.reactions) as [ReactionKey, string[] | undefined][]).filter(([, ids]) => (ids?.length ?? 0) > 0).sort((a, b) => (b[1]?.length ?? 0) - (a[1]?.length ?? 0));

  return (
    <div className="kn-reactions">
      <div className="chips">
        {entries.map(([key, ids]) => (
          <button key={key} className={mine === key ? "on" : undefined} onClick={() => react(post, key)} aria-pressed={mine === key} title={REACTIONS[key].label}>
            <span aria-hidden>{REACTIONS[key].glyph}</span>
            {ids?.length}
          </button>
        ))}
        {entries.length === 0 && <span className="none">Be the first to react</span>}
      </div>
      <div className="pick-wrap">
        <button className="pick-btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="React">
          {mine ? <span aria-hidden>{REACTIONS[mine].glyph}</span> : <span aria-hidden>＋</span>} React
        </button>
        {open && (
          <div className="pick-menu" role="menu" onMouseLeave={() => setOpen(false)}>
            {(Object.keys(REACTIONS) as ReactionKey[]).map((key) => (
              <button key={key} role="menuitem" className={mine === key ? "on" : undefined} onClick={() => { react(post, key); setOpen(false); }}>
                <span aria-hidden>{REACTIONS[key].glyph}</span>
                {REACTIONS[key].label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
