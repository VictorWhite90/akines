"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight2 } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import DateOfBirth from "@/components/ui/DateOfBirth";
import { useMe } from "@/components/shell/MemberContext";
import { account, fullName, type MyProfile } from "@/lib/api/account";
import { Notice, Status, useLoad } from "./useLoad";

/** Private account details. Public profile fields (name, photo, bio...) are edited on the profile page. */
export default function PersonalSection() {
  const profile = useLoad(account.profile);
  const { setFromProfile } = useMe();
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad"; field?: string } | null>(null);

  useEffect(() => {
    if (!profile.data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the form once the profile arrives
    setPhone(profile.data.phone_number ?? "");
    setDob(profile.data.date_of_birth ?? "");
  }, [profile.data]);

  if (!profile.data) return <Status loading={profile.loading} error={profile.error} onRetry={profile.reload} />;
  const p = profile.data;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const changes: Partial<MyProfile> = {};
    if (phone.trim() !== p.phone_number) changes.phone_number = phone.trim();
    if (!p.date_of_birth && dob) changes.date_of_birth = dob;
    if (!Object.keys(changes).length) return setNotice({ text: "Nothing to save.", tone: "ok" });
    setSaving(true);
    const r = await account.updateProfile(changes);
    setSaving(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad", field: r.field });
    profile.setData(r.data);
    setFromProfile(r.data);
    setNotice({ text: "Saved.", tone: "ok" });
  };

  return (
    <div className="st-stack">
      <Link href="/profile" className="kh-card st-card st-profile-link">
        <Avatar person={{ name: fullName(p), photo: p.profile_photo }} size={48} />
        <span>
          <b>{fullName(p)}</b>
          <small>{p.username ? `@${p.username} · ` : ""}Your name, photos, bio and interests are edited on your profile</small>
        </span>
        <ArrowRight2 size={18} color="currentColor" />
      </Link>

      <form className="cm-form kh-card st-card" onSubmit={save} noValidate>
        <h3>Private details</h3>
        <p className="st-lead">Only you can see these. They're never shown on your profile.</p>
        <div className="cm-field">
          <label htmlFor="st-phone">Mobile number <small>One account per number</small></label>
          <input id="st-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={notice?.field === "phone_number" ? true : undefined} placeholder="0803 123 4567" />
        </div>
        <div className="cm-field">
          <label htmlFor="st-dob" id="st-dob-label">Date of birth <small>{p.date_of_birth ? "Can't be changed" : "Can only be set once"}</small></label>
          <DateOfBirth id="st-dob" value={dob} onChange={setDob} minAge={18} disabled={!!p.date_of_birth} invalid={notice?.field === "date_of_birth"} />
        </div>
        <dl className="st-facts">
          <div><dt>Email</dt><dd>{p.email}</dd></div>
        </dl>
        <Notice text={notice?.text ?? null} tone={notice?.tone} />
        <button className="kh-btn primary st-save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </form>
    </div>
  );
}
