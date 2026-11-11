"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Avatar from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { useMe } from "@/components/shell/MemberContext";
import { account, fullName, type MyProfile } from "@/lib/api/account";
import BirthDate from "./BirthDate";
import { Block, Notice, Status, useLoad } from "./useLoad";

/** Private account details. Public profile fields (name, photo, bio...) are edited on the profile page. */
export default function PersonalSection() {
  const profile = useLoad(account.profile);
  const { setFromProfile } = useMe();
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad"; field?: string } | null>(null);
  /** The new number waiting for its code (a code is texted to it before it replaces the old one). */
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");

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
    if (!p.date_of_birth && dob) changes.date_of_birth = dob;
    const newPhone = phone.trim() && phone.trim() !== (p.phone_number ?? "") ? phone.trim() : null;
    if (!Object.keys(changes).length && !newPhone) return setNotice({ text: "Nothing to save.", tone: "ok" });
    setSaving(true);
    if (Object.keys(changes).length) {
      const r = await account.updateProfile(changes);
      if (!r.ok) { setSaving(false); return setNotice({ text: r.message, tone: "bad", field: r.field }); }
      profile.setData(r.data);
      setFromProfile(r.data);
    }
    if (newPhone) {
      const r = await account.requestPhoneChange(newPhone);
      setSaving(false);
      // The same number written another way (0803… for +234803…) isn't a change.
      if (!r.ok && /already your/i.test(r.message)) return setNotice({ text: "Saved.", tone: "ok" });
      if (!r.ok) return setNotice({ text: r.message, tone: "bad", field: "phone_number" });
      setPendingPhone(r.data.phone_number);
      setCode("");
      return setNotice({ text: `We've sent a 6-digit code to ${r.data.phone_number}. Enter it to change your number.`, tone: "ok" });
    }
    setSaving(false);
    setNotice({ text: "Saved.", tone: "ok" });
  };

  const confirmPhone = async () => {
    const otp = code.replace(/\D/g, "");
    if (otp.length !== 6) return setNotice({ text: "Enter the 6-digit code.", tone: "bad", field: "phone_code" });
    setSaving(true);
    const r = await account.confirmPhoneChange(otp);
    setSaving(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad", field: "phone_code" });
    const updated = { ...p, phone_number: r.data.phone_number };
    profile.setData(updated);
    setFromProfile(updated);
    setPendingPhone(null);
    setPhone(r.data.phone_number);
    setNotice({ text: "Your mobile number has been changed.", tone: "ok" });
  };

  return (
    <div className="ch-set__stack">
      <Link href="/profile" className="ch-set__profile">
        <Avatar person={{ name: fullName(p), photo: p.profile_photo }} size={48} />
        <span className="ch-set__rowtext">
          <span className="ch-set__rowtitle">{fullName(p)}</span>
          <span className="ch-set__rowdesc">{p.username ? `@${p.username} · ` : ""}Your name, photos, bio and interests are edited on your profile</span>
        </span>
        <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
      </Link>

      <Block title="Private details" text="Only you can see these. They're never shown on your profile.">
        <form className="ch-set__fields" onSubmit={save} noValidate>
          <Field label="Mobile number" hint="One account per number">
            <Input id="st-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setPendingPhone(null); }} invalid={notice?.field === "phone_number"} placeholder="0803 123 4567" />
          </Field>
          {pendingPhone ? (
            <>
              <Field label={`Code sent to ${pendingPhone}`} hint="Expires in 10 minutes">
                <Input id="st-phone-code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} placeholder="123 456" onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void confirmPhone(); } }} invalid={notice?.field === "phone_code"} />
              </Field>
              <div className="ch-set__acts"><Button variant="secondary" onClick={() => void confirmPhone()} disabled={saving}>Confirm number</Button></div>
            </>
          ) : null}
          <div className="k-field">
            <label className="k-field__label" htmlFor="st-dob" id="st-dob-label">Date of birth</label>
            <BirthDate id="st-dob" value={dob} onChange={setDob} minAge={18} disabled={!!p.date_of_birth} invalid={notice?.field === "date_of_birth"} />
            <p className="k-field__msg">{p.date_of_birth ? "Can't be changed" : "Can only be set once"}</p>
          </div>
          <div className="ch-set__list">
            <div className="ch-set__row">
              <div className="ch-set__rowtext"><span className="ch-set__rowtitle">Email</span><span className="ch-set__rowdesc">{p.email ?? "None"}</span></div>
            </div>
          </div>
          <Notice text={notice?.text ?? null} tone={notice?.tone} />
          <div className="ch-set__acts"><Button type="submit" arrow="right" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>
        </form>
      </Block>
    </div>
  );
}
