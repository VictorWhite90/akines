"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { account } from "@/lib/api/account";
import { Notice } from "./useLoad";

const MAX_SIDE = 1280;

/**
 * Shrinks a photo on the device before upload (upright, at most 1280px, JPEG), so a 4 MB phone photo costs
 * a few hundred KB of data. The server still checks, crops and re-encodes it. Formats the browser can't
 * decode (e.g. HEIC on some Android browsers) are sent as they are and the server explains if it can't use them.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.88));
  } catch {
    return file;
  }
}

export default function ProfilePhoto({ name, photo, onChange }: { name: string; photo: string | null; onChange: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setNotice({ text: "Choose a photo (JPG, PNG or WebP).", tone: "bad" });

    setBusy("upload");
    setNotice(null);
    const blob = await shrink(file);
    const local = URL.createObjectURL(blob);
    setPreview(local);
    const r = await account.uploadPhoto(blob);
    setBusy(null);
    URL.revokeObjectURL(local);
    setPreview(null);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setNotice({ text: "Photo updated.", tone: "ok" });
    onChange();
  };

  const remove = async () => {
    setBusy("remove");
    const r = await account.removePhoto();
    setBusy(null);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setNotice({ text: "Photo removed.", tone: "ok" });
    onChange();
  };

  return (
    <div className="st-photo">
      <span className={`st-photo-img${busy === "upload" ? " busy" : ""}`}>
        <Avatar person={{ name: name || " ", photo: preview ?? photo }} size={88} />
      </span>
      <div>
        <span className="st-row">
          <button type="button" className="kh-btn primary sm" onClick={() => input.current?.click()} disabled={busy !== null}>
            {busy === "upload" ? "Uploading…" : photo ? "Change photo" : "Upload photo"}
          </button>
          {photo && <button type="button" className="kh-btn outline sm" onClick={remove} disabled={busy !== null}>{busy === "remove" ? "Removing…" : "Remove"}</button>}
        </span>
        <small className="st-lead">A clear photo of your face helps people recognise you at meet-ups.</small>
        <Notice text={notice?.text ?? null} tone={notice?.tone} />
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" onChange={pick} hidden />
    </div>
  );
}
