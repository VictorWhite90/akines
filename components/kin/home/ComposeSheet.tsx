"use client";

import { useRef, useState } from "react";
import { CloseCircle, Gallery } from "iconsax-reactjs";
import Image from "next/image";
import Button from "@/components/kin/Button";
import Sheet from "@/components/kin/Sheet";
import { usePosts } from "@/components/feed/usePosts";
import { CIRCLES } from "@/lib/data/community";
import { POST_TYPES, type PostType } from "@/lib/data/feed";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { SHARE_PICKER } from "@/lib/data/roomChat";
import { shrinkImage } from "@/lib/imageShrink";

const TYPES = Object.keys(POST_TYPES) as PostType[];
const MAX = 4;
const asDataUrl = (file: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => (typeof r.result === "string" ? res(r.result) : rej(new Error("read"))); r.onerror = () => rej(r.error); r.readAsDataURL(file); });

/** The composer, as a sheet: pick what kind of post, write, add photos, choose a circle. Posts through the shared store. */
export default function ComposeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addPost } = usePosts();
  const [type, setType] = useState<PostType>("share");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<PhotoKey | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [samples, setSamples] = useState(false);
  const [circle, setCircle] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const reset = () => { setText(""); setPhoto(null); setImages([]); setSamples(false); setType("share"); };
  const submit = () => {
    if (!text.trim() && !photo && !images.length) return;
    addPost({ type, text, photo: photo ?? undefined, photos: images, circle: circle || undefined });
    reset();
    onClose();
  };
  const pickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/")).slice(0, MAX - images.length);
    e.target.value = "";
    const picked = await Promise.all(files.map(async (f) => { try { return await asDataUrl(await shrinkImage(f, 1200)); } catch { return null; } }));
    setImages((cur) => [...cur, ...picked.filter((s): s is string => !!s)].slice(0, MAX));
  };

  return (
    <Sheet open={open} onClose={onClose} title="Share with your circles" sub={POST_TYPES[type].placeholder}>
      <div className="k-stack">
        <div className="h-types" role="group" aria-label="What kind of post">
          {TYPES.map((k) => <button key={k} type="button" aria-pressed={type === k} onClick={() => setType(k)}>{POST_TYPES[k].label}</button>)}
        </div>
        <textarea className="k-input" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={POST_TYPES[type].placeholder} aria-label="Your post" autoFocus />
        {(photo || images.length > 0) && (
          <div className="h-thumbs">
            {photo && <span><Image src={PHOTO[photo].src} alt="" fill sizes="80px" style={{ objectFit: "cover" }} /><button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"><CloseCircle size={14} color="currentColor" /></button></span>}
            {images.map((src, i) => (
              <span key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                <img src={src} alt="" />
                <button type="button" onClick={() => setImages((c) => c.filter((_, j) => j !== i))} aria-label="Remove image"><CloseCircle size={14} color="currentColor" /></button>
              </span>
            ))}
          </div>
        )}
        {samples && (
          <div className="h-samples" role="group" aria-label="Sample photos">
            {SHARE_PICKER.map((k) => <button key={k} type="button" onClick={() => { setPhoto(k); setSamples(false); }} aria-label={PHOTO[k].alt}><Image src={PHOTO[k].src} alt="" fill sizes="120px" style={{ objectFit: "cover" }} /></button>)}
          </div>
        )}
        <div className="h-sheet-foot">
          <Button variant="ghost" icon onClick={() => file.current?.click()} disabled={images.length >= MAX} aria-label="Add photos"><Gallery size={22} color="currentColor" /></Button>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={pickFiles} />
          <Button variant="ghost" size="sm" onClick={() => setSamples((v) => !v)} aria-pressed={samples}>Samples</Button>
          <select className="k-input" value={circle} onChange={(e) => setCircle(e.target.value)} aria-label="Post to a circle">
            <option value="">Not in a circle</option>
            {CIRCLES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Button variant="primary" block onClick={submit} disabled={!text.trim() && !photo && !images.length}>Post</Button>
      </div>
    </Sheet>
  );
}
