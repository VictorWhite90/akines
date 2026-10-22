"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Pic from "@/components/home/Pic";
import { SHARE_PICKER } from "@/lib/data/roomChat";
import { CIRCLES } from "@/lib/data/community";
import { ME } from "@/lib/data/people";
import { POST_TYPES, type PostType } from "@/lib/data/feed";
import type { PhotoKey } from "@/lib/data/images";
import { shrinkImage } from "@/lib/imageShrink";
import { usePosts } from "./usePosts";

const TYPES = Object.keys(POST_TYPES) as PostType[];
const MAX_IMAGES = 4;

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image"));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

/** The "not just Create Post" composer: pick a post type, and the placeholder and follow-through change with it. Always shown open — no click-to-expand step. */
export default function Composer({ circle, onPosted }: { circle?: string; onPosted?: () => void }) {
  const { addPost } = usePosts();
  const [type, setType] = useState<PostType>("share");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<PhotoKey | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pickPhoto, setPickPhoto] = useState(false);
  const [circleId, setCircleId] = useState(circle ?? "");
  const fileInput = useRef<HTMLInputElement>(null);

  const clear = () => {
    setText("");
    setPhoto(null);
    setImages([]);
    setPickPhoto(false);
    setType("share");
  };

  const submit = () => {
    if (!text.trim() && !photo && images.length === 0) return;
    addPost({ type, text, photo: photo ?? undefined, photos: images, circle: circleId || undefined });
    clear();
    onPosted?.();
  };

  const pickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - images.length);
    e.target.value = "";
    const selected = await Promise.all(files.map(async (file) => {
      if (!file.type.startsWith("image/")) return null;
      try {
        return await readAsDataUrl(await shrinkImage(file, 1200));
      } catch {
        return null;
      }
    }));
    setImages((current) => [...current, ...selected.filter((src): src is string => src !== null)].slice(0, MAX_IMAGES));
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
      {(photo || images.length > 0) && (
        <div className="photo-preview">
          {photo && <span className="photo-thumb"><Pic name={photo} sizes="120px" /><button onClick={() => setPhoto(null)} aria-label="Remove photo">×</button></span>}
          {images.map((src, index) => (
            <span className="photo-thumb" key={`${index}-${src.slice(0, 32)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- compressed local preview */}
              <img src={src} alt={`Selected post image ${index + 1}`} />
              <button onClick={() => setImages((current) => current.filter((_, i) => i !== index))} aria-label={`Remove image ${index + 1}`}>×</button>
            </span>
          ))}
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
          <button type="button" onClick={() => fileInput.current?.click()} disabled={images.length >= MAX_IMAGES} aria-label={`Upload photos, up to ${MAX_IMAGES}`}>🖼 Upload photos{images.length > 0 ? ` ${images.length}/${MAX_IMAGES}` : ""}</button>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={pickFiles} />
          <button type="button" onClick={() => setPickPhoto((v) => !v)} aria-pressed={pickPhoto}>Choose sample</button>
          {!circle && (
            <select value={circleId} onChange={(e) => setCircleId(e.target.value)} aria-label="Post to a circle (optional)">
              <option value="">Not in a circle</option>
              {CIRCLES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="actions">
          <button type="button" className="ghost" onClick={clear} disabled={!text.trim() && !photo && images.length === 0}>Clear</button>
          <button type="button" className="go" disabled={!text.trim() && !photo && images.length === 0} onClick={submit}>{POST_TYPES[type].verb === "shared" ? "Post" : `Post ${POST_TYPES[type].label.toLowerCase()}`}</button>
        </div>
      </div>
    </div>
  );
}
