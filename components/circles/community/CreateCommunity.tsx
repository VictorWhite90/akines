"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera } from "iconsax-reactjs";
import { AREAS, CATEGORIES, communities } from "@/lib/api/community";
import { shrinkImage } from "@/lib/imageShrink";

/** One-page form for a community circle. The creator leads it; the Akines team verifies it. */
export default function CreateCommunity() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", tagline: "", about: "", category: "social_hangouts", area: "Wuse 2", instagram: "", whatsapp: "" });
  const [cover, setCover] = useState<{ blob: Blob; url: string } | null>(null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ text: string; field?: string } | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const errors = {
    name: f.name.trim().length < 3 ? "Give your community a name (at least 3 letters)." : "",
    about: f.about.trim().length < 20 ? "Tell people what you do in a sentence or two." : "",
  };
  const fieldError = (k: string) => (tried && errors[k as keyof typeof errors]) || (failure?.field === k ? failure.text : "");

  const pickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const blob = await shrinkImage(file, 2000);
    setCover({ blob, url: URL.createObjectURL(blob) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.about || busy) return;
    setBusy(true);
    setFailure(null);
    const r = await communities.create({ ...f, name: f.name.trim(), tagline: f.tagline.trim(), about: f.about.trim() });
    if (!r.ok) {
      setBusy(false);
      return setFailure({ text: r.message, field: r.field });
    }
    // The cover is optional: a failed upload never blocks the new community (it can be added from Manage).
    if (cover) await communities.uploadCover(r.data.id, cover.blob);
    router.push(`/circles/community/${r.data.id}?welcome=1`);
  };

  return (
    <div className="kh cm-create">
      <Link href="/circles/new" className="cm-back">← Back</Link>
      <header>
        <p className="cm-over">Community circle</p>
        <h1>Bring your community to Akines</h1>
        <p>For clubs, hangouts, faith groups, book clubs and any community that meets in person. You&apos;ll be the leader and can make others leaders later.</p>
      </header>

      <form className="cm-form" onSubmit={submit} noValidate>
        <button type="button" className="cm-cover-pick" onClick={() => coverInput.current?.click()} aria-label={cover ? "Change cover photo" : "Add a cover photo"}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
          {cover && <img src={cover.url} alt="" />}
          <span><Camera size={20} color="currentColor" />{cover ? "Change cover photo" : "Add a cover photo"} <small>optional</small></span>
        </button>
        <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" hidden onChange={pickCover} />

        <div className="cm-field">
          <label htmlFor="cc-name">Community name</label>
          <input id="cc-name" value={f.name} onChange={set("name")} placeholder="e.g. Sunday Table Abuja" maxLength={60} aria-invalid={!!fieldError("name") || undefined} />
          {fieldError("name") && <span className="cm-err">{fieldError("name")}</span>}
        </div>
        <div className="cm-field">
          <label htmlFor="cc-tag">One-line tagline <small>optional</small></label>
          <input id="cc-tag" value={f.tagline} onChange={set("tagline")} placeholder="e.g. Come alone, leave with friends." maxLength={140} />
        </div>
        <div className="cm-field">
          <label htmlFor="cc-about">What does your community do?</label>
          <textarea id="cc-about" value={f.about} onChange={set("about")} rows={4} maxLength={2000} placeholder="Who it's for, what happens when you meet, how often." aria-invalid={!!fieldError("about") || undefined} />
          {fieldError("about") && <span className="cm-err">{fieldError("about")}</span>}
        </div>
        <div className="cm-two">
          <div className="cm-field">
            <label htmlFor="cc-cat">Category</label>
            <select id="cc-cat" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
          </div>
          <div className="cm-field">
            <label htmlFor="cc-area">Main area in Abuja</label>
            <select id="cc-area" value={f.area} onChange={set("area")}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
          </div>
        </div>
        <div className="cm-two">
          <div className="cm-field">
            <label htmlFor="cc-ig">Instagram <small>optional</small></label>
            <input id="cc-ig" value={f.instagram} onChange={set("instagram")} placeholder="@yourcommunity" autoCapitalize="none" aria-invalid={!!fieldError("instagram") || undefined} />
            {fieldError("instagram") && <span className="cm-err">{fieldError("instagram")}</span>}
          </div>
          <div className="cm-field">
            <label htmlFor="cc-wa">WhatsApp contact <small>optional</small></label>
            <input id="cc-wa" value={f.whatsapp} onChange={set("whatsapp")} placeholder="0803 123 4567" inputMode="tel" aria-invalid={!!fieldError("whatsapp") || undefined} />
            {fieldError("whatsapp") && <span className="cm-err">{fieldError("whatsapp")}</span>}
          </div>
        </div>
        {failure && !failure.field && <p className="st-notice bad" role="alert">{failure.text}</p>}
        <p className="cm-small">Your community starts invite-only: members join with your invite link. The Akines team verifies communities, usually within two days; verified communities can open joining to everyone.</p>
        <button className="kh-btn amber cm-submit" type="submit" disabled={busy}>{busy ? "Creating…" : "Create community circle"}</button>
      </form>
    </div>
  );
}
