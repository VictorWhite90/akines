"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Pic from "@/components/home/Pic";
import { SHARE_PICKER } from "@/lib/data/roomChat";
import { CIRCLES } from "@/lib/data/community";
import { ME } from "@/lib/data/people";
import { POST_TYPES, type PostType } from "@/lib/data/feed";
import type { PhotoKey } from "@/lib/data/images";
import { usePosts } from "./usePosts";

const TYPES = Object.keys(POST_TYPES) as PostType[];

/** The "not just Create Post" composer: pick a post type, and the placeholder and follow-through change with it. Always shown open — no click-to-expand step. */
export default function Composer({ circle, onPosted }: { circle?: string; onPosted?: () => void }) {
  const { addPost } = usePosts();
  const [type, setType] = useState<PostType>("share");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<PhotoKey | null>(null);
  const [pickPhoto, setPickPhoto] = useState(false);
  const [circleId, setCircleId] = useState(circle ?? "");

  const clear = () => {
    setText("");
    setPhoto(null);
    setPickPhoto(false);
    setType("share");
  };

  const submit = () => {
    if (!text.trim()) return;
    addPost({ type, text, photo: photo ?? undefined, circle: circleId || undefined });
    clear();
    onPosted?.();
  };

  return (
    <div className="kn-composer">
      <div className="types" role="tablist" aria-label="Post type">
        {TYPES.map((k) => (
          <button key={k} role="tab" aria-selected={type === k} className={type === k ? "on" : undefined} onClick={() => setType(k)}>
            <span aria-hidden>{POST_TYPES[k].glyph}</span>{POST_TYPES[k].label}
          </button>
        ))}
      </div>
      <div className="row">
        <Avatar person={ME} size={38} />
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={POST_TYPES[type].placeholder} />
      </div>
      {photo && (
        <div className="photo-preview">
          <Pic name={photo} sizes="120px" />
          <button onClick={() => setPhoto(null)} aria-label="Remove photo">×</button>
        </div>
      )}
      {pickPhoto && (
        <div className="photo-grid" role="dialog" aria-label="Choose a photo">
          {SHARE_PICKER.map((k) => (
            <button key={k} onClick={() => { setPhoto(k); setPickPhoto(false); }}><Pic name={k} sizes="100px" /></button>
          ))}
        </div>
      )}
      <div className="foot">
        <div className="tools">
          <button type="button" onClick={() => setPickPhoto((v) => !v)} aria-pressed={pickPhoto}>🖼 Photo</button>
          {!circle && (
            <select value={circleId} onChange={(e) => setCircleId(e.target.value)} aria-label="Post to a circle (optional)">
              <option value="">Not in a circle</option>
              {CIRCLES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="actions">
          <button type="button" className="ghost" onClick={clear} disabled={!text.trim() && !photo}>Clear</button>
          <button type="button" className="go" disabled={!text.trim()} onClick={submit}>{POST_TYPES[type].verb === "shared" ? "Post" : `Post ${POST_TYPES[type].label.toLowerCase()}`}</button>
        </div>
      </div>
    </div>
  );
}
