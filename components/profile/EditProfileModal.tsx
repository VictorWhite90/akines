"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, CloseCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { useMe } from "@/components/shell/MemberContext";
import { account, type Interest, type MyProfile } from "@/lib/api/account";
import { shrinkImage } from "@/lib/imageShrink";
import { rememberMember } from "@/lib/session";

type Photo = { blob: Blob; url: string } | "remove" | null;

/** X-style editor: cover and photo with camera buttons on them, labelled fields, Save in the header. Applied on Save. */
export default function EditProfileModal({ profile, onClose, onSaved }: { profile: MyProfile; onClose: () => void; onSaved: (p: MyProfile) => void }) {
  const { setFromProfile } = useMe();
  const [form, setForm] = useState({
    first_name: profile.first_name ?? "", last_name: profile.last_name ?? "", username: profile.username ?? "",
    bio: profile.bio ?? "", location: profile.location ?? "", website: profile.website ?? "", interests: profile.interests ?? [],
  });
  const [avatar, setAvatar] = useState<Photo>(null);
  const [cover, setCover] = useState<Photo>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [handle, setHandle] = useState<{ ok: boolean; reason: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void account.interests().then((r) => r.ok && setInterests(r.data));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  // Free preview images when they're replaced or the editor closes.
  useEffect(() => () => { if (avatar && avatar !== "remove") URL.revokeObjectURL(avatar.url); }, [avatar]);
  useEffect(() => () => { if (cover && cover !== "remove") URL.revokeObjectURL(cover.url); }, [cover]);

  useEffect(() => {
    const value = form.username.trim().replace(/^@/, "");
    if (!value || value === profile.username) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to check
      setHandle(null);
      return;
    }
    const t = setTimeout(async () => {
      const r = await account.usernameAvailable(value);
      if (r.ok) setHandle({ ok: r.data.available, reason: r.data.reason });
    }, 400);
    return () => clearTimeout(t);
  }, [form.username, profile.username]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const pick = (which: "avatar" | "cover") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError({ text: "Choose a photo (JPG, PNG or WebP)." });
    const blob = await shrinkImage(file, which === "cover" ? 2000 : 1280);
    (which === "cover" ? setCover : setAvatar)({ blob, url: URL.createObjectURL(blob) });
  };

  const avatarSrc = avatar === "remove" ? null : avatar?.url ?? profile.profile_photo;
  const coverSrc = cover === "remove" ? null : cover?.url ?? profile.cover_photo;
  const name = [form.first_name, form.last_name].join(" ").trim();

  const save = async () => {
    setSaving(true);
    setError(null);
    type Result = { ok: boolean; message?: string | null };
    const steps: [Photo, (b: Blob) => Promise<Result>, () => Promise<Result>][] = [
      [avatar, account.uploadPhoto, account.removePhoto],
      [cover, account.uploadCover, account.removeCover],
    ];
    for (const [photo, upload, remove] of steps) {
      if (!photo) continue;
      const r = photo === "remove" ? await remove() : await upload(photo.blob);
      if (!r.ok) {
        setSaving(false);
        return setError({ text: r.message ?? "The photo didn't upload. Please try again." });
      }
    }
    const r = await account.updateProfile({ ...form, username: form.username.trim().replace(/^@/, "") || null });
    setSaving(false);
    if (!r.ok) return setError({ text: r.message, field: r.field });
    rememberMember(r.data);
    setFromProfile(r.data);
    onSaved(r.data);
  };

  const bad = (field: string) => error?.field === field;

  return createPortal(
    <div className="ep-scrim" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="kh ep" role="dialog" aria-modal="true" aria-labelledby="ep-title">
        <header className="ep-top">
          <button className="ep-x" onClick={onClose} disabled={saving} aria-label="Close">×</button>
          <h2 id="ep-title">Edit profile</h2>
          <button className="kh-btn primary sm" onClick={save} disabled={saving || (handle !== null && !handle.ok)}>{saving ? "Saving…" : "Save"}</button>
        </header>

        <div className="ep-body">
          <div className="ep-cover">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview or member-uploaded banner */}
            {coverSrc && <img src={coverSrc} alt="" />}
            <span className="ep-tools">
              <button type="button" onClick={() => coverInput.current?.click()} aria-label="Change cover photo"><Camera size={20} color="currentColor" /></button>
              {coverSrc && <button type="button" onClick={() => setCover("remove")} aria-label="Remove cover photo"><CloseCircle size={20} color="currentColor" /></button>}
            </span>
          </div>
          <div className="ep-ava">
            <Avatar person={{ name: name || " ", photo: avatarSrc }} size={112} />
            <button type="button" className="ep-ava-btn" onClick={() => avatarInput.current?.click()} aria-label="Change profile photo"><Camera size={20} color="currentColor" /></button>
            {avatarSrc && <button type="button" className="ep-ava-rm" onClick={() => setAvatar("remove")}>Remove photo</button>}
          </div>

          {error && <p className="st-notice bad" role="alert">{error.text}</p>}

          <div className="ep-fields">
            <span className="ep-row">
              <label className={`ep-f${bad("first_name") ? " bad" : ""}`}><span>First name</span><input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} maxLength={50} autoComplete="given-name" /></label>
              <label className={`ep-f${bad("last_name") ? " bad" : ""}`}><span>Last name</span><input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} maxLength={50} autoComplete="family-name" /></label>
            </span>
            <label className={`ep-f${bad("username") || (handle && !handle.ok) ? " bad" : ""}`}>
              <span>Username</span>
              <span className="ep-at"><i aria-hidden>@</i><input value={form.username} onChange={(e) => set("username", e.target.value.toLowerCase())} maxLength={31} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></span>
              {handle && <em className={handle.ok ? "ok" : "no"}>{handle.ok ? "Available" : handle.reason}</em>}
            </label>
            <label className={`ep-f${bad("bio") ? " bad" : ""}`}>
              <span>Bio <small>{form.bio.length}/300</small></span>
              <textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={300} />
            </label>
            <label className={`ep-f${bad("location") ? " bad" : ""}`}><span>Location</span><input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={60} placeholder="e.g. Wuse 2, Abuja" /></label>
            <label className={`ep-f${bad("website") ? " bad" : ""}`}><span>Website</span><input value={form.website} onChange={(e) => set("website", e.target.value)} maxLength={200} inputMode="url" autoCapitalize="none" placeholder="yourname.com" /></label>

            <div className="ep-f ep-static">
              <span>Interests <small>Used to introduce you to people with something in common</small></span>
              <div className="st-pills" role="group" aria-label="Interests">
                {interests.map((i) => {
                  const on = form.interests.includes(i.slug);
                  return <button type="button" key={i.slug} className={on ? "on" : undefined} aria-pressed={on} onClick={() => set("interests", on ? form.interests.filter((s) => s !== i.slug) : [...form.interests, i.slug])}>{i.name}</button>;
                })}
              </div>
            </div>
          </div>
        </div>

        <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" hidden onChange={pick("avatar")} />
        <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" hidden onChange={pick("cover")} />
      </div>
    </div>,
    document.body,
  );
}
