"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { ME, PEOPLE } from "@/lib/data/people";
import { useComments } from "./useComments";

/** Read and reply, right under the post — X-style, not a separate page. */
export default function CommentThread({ postId }: { postId: string }) {
  const { comments, add } = useComments(postId);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  return (
    <div className="kn-comments">
      {comments.map((c) => (
        <div className="kn-comment" key={c.id}>
          <Avatar person={PEOPLE[c.by]} size={26} />
          <div className="bubble">
            <span><b>{PEOPLE[c.by].name}</b>{c.text}</span>
            <small>{c.at}</small>
          </div>
        </div>
      ))}
      <div className="kn-comment-form">
        <Avatar person={ME} size={26} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a reply…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="button" onClick={send} disabled={!text.trim()} aria-label="Send reply">↑</button>
      </div>
    </div>
  );
}
