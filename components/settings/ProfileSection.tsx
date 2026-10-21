"use client";

import { useEffect, useState } from "react";
import { account, type MyProfile } from "@/lib/api/account";
import { rememberMember } from "@/lib/session";
import DateOfBirth from "@/components/ui/DateOfBirth";
import { Notice, Status, useLoad } from "./useLoad";

type Form = Pick<MyProfile, "first_name" | "last_name" | "username" | "bio" | "interests" | "phone_number"> & { date_of_birth: string };

export default function ProfileSection() {
  const profile = useLoad(account.profile);
  const interests = useLoad(account.interests);
  const [form, setForm] = useState<Form | null>(null);
  const [handle, setHandle] = useState<{ ok: boolean; reason: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad"; field?: string } | null>(null);

  useEffect(() => {
    if (!profile.data || form) return;
    const { first_name, last_name, username, bio, interests: chosen, phone_number, date_of_birth } = profile.data;
    // Every field starts as a string or array so inputs stay controlled from the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the form once the profile arrives
    setForm({ first_name: first_name ?? "", last_name: last_name ?? "", username: username ?? "", bio: bio ?? "", interests: chosen ?? [], phone_number: phone_number ?? "", date_of_birth: date_of_birth ?? "" });
  }, [profile.data, form]);

  // Live @username check, a moment after typing stops.
  useEffect(() => {
    const value = form?.username?.trim().replace(/^@/, "") ?? "";
    if (!value || value === profile.data?.username) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to check
      setHandle(null);
      return;
    }
    const t = setTimeout(async () => {
      const r = await account.usernameAvailable(value);
      if (r.ok) setHandle({ ok: r.data.available, reason: r.data.reason });
    }, 400);
    return () => clearTimeout(t);
  }, [form?.username, profile.data?.username]);

  if (!form) return <Status loading={profile.loading} error={profile.error} onRetry={profile.reload} />;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const toggleInterest = (slug: string) => set("interests", form.interests.includes(slug) ? form.interests.filter((s) => s !== slug) : [...form.interests, slug]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const { date_of_birth, phone_number, ...rest } = form;
    const changes: Partial<MyProfile> = { ...rest, username: form.username?.trim() || null };
    if (phone_number.trim() !== profile.data?.phone_number) changes.phone_number = phone_number.trim();
    // Date of birth can only be set once; after that the server refuses changes.
    if (!profile.data?.date_of_birth && date_of_birth) changes.date_of_birth = date_of_birth;
    const r = await account.updateProfile(changes);
    setSaving(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad", field: r.field });
    profile.setData(r.data);
    setForm((f) => (f ? { ...f, phone_number: r.data.phone_number, date_of_birth: r.data.date_of_birth ?? "" } : f));
    rememberMember(r.data);
    setHandle(null);
    setNotice({ text: "Profile saved.", tone: "ok" });
  };

  const bad = (field: string) => (notice?.tone === "bad" && notice.field === field ? true : undefined);

  return (
    <form className="cm-form" onSubmit={save} noValidate>
      <div className="cm-two">
        <div className="cm-field">
          <label htmlFor="st-first">First name</label>
          <input id="st-first" autoComplete="given-name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} aria-invalid={bad("first_name")} maxLength={50} />
        </div>
        <div className="cm-field">
          <label htmlFor="st-last">Last name</label>
          <input id="st-last" autoComplete="family-name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} aria-invalid={bad("last_name")} maxLength={50} />
        </div>
      </div>

      <div className="cm-field">
        <label htmlFor="st-handle">Username <small>How people find and mention you</small></label>
        <div className="st-handle">
          <span aria-hidden>@</span>
          <input id="st-handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={form.username ?? ""} onChange={(e) => set("username", e.target.value.toLowerCase())} aria-invalid={bad("username") ?? (handle && !handle.ok ? true : undefined)} maxLength={31} placeholder="yourname" />
        </div>
        {handle && <span className={handle.ok ? "st-ok" : "cm-err"}>{handle.ok ? "Available" : handle.reason}</span>}
      </div>

      <div className="cm-field">
        <label htmlFor="st-bio">Bio <small>{form.bio.length}/300</small></label>
        <textarea id="st-bio" rows={3} value={form.bio} maxLength={300} onChange={(e) => set("bio", e.target.value)} placeholder="A line or two about you: what you do, what you care about." />
      </div>

      <div className="cm-field">
        <span className="cm-l">Interests <small>Used to introduce you to people with something in common</small></span>
        <div className="st-pills" role="group" aria-label="Interests">
          {(interests.data ?? []).map((i) => (
            <button type="button" key={i.slug} className={form.interests.includes(i.slug) ? "on" : undefined} aria-pressed={form.interests.includes(i.slug)} onClick={() => toggleInterest(i.slug)}>{i.name}</button>
          ))}
        </div>
      </div>

      <div className="cm-two">
        <div className="cm-field">
          <label htmlFor="st-phone">Mobile number <small>One account per number</small></label>
          <input id="st-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone_number ?? ""} onChange={(e) => set("phone_number", e.target.value)} aria-invalid={bad("phone_number")} placeholder="0803 123 4567" />
        </div>
        <div className="cm-field">
          <label htmlFor="st-dob" id="st-dob-label">Date of birth <small>{profile.data?.date_of_birth ? "Can't be changed" : "Can only be set once"}</small></label>
          <DateOfBirth id="st-dob" value={form.date_of_birth} onChange={(iso) => set("date_of_birth", iso)} minAge={18} disabled={!!profile.data?.date_of_birth} invalid={!!bad("date_of_birth")} />
        </div>
      </div>
      <p className="st-lead">Only you can see your email, mobile number and date of birth.</p>

      <dl className="st-facts">
        <div><dt>Email</dt><dd>{profile.data?.email}</dd></div>
      </dl>

      <Notice text={notice?.text ?? null} tone={notice?.tone} />
      <button className="kh-btn primary st-save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
