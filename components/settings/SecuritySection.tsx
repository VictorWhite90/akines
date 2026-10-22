"use client";

import { useState } from "react";
import { account } from "@/lib/api/account";
import { STRONG, STRONG_HINT } from "@/components/auth/LoginScreen";
import { Notice, Status, useLoad } from "./useLoad";

export default function SecuritySection() {
  const profile = useLoad(account.profile);
  return (
    <div className="st-stack">
      <PasswordForm />
      {profile.data ? (
        <TwoStep enabled={profile.data.is_2fa_set} email={profile.data.email} onChange={(on) => profile.setData({ ...profile.data!, is_2fa_set: on })} />
      ) : (
        <Status loading={profile.loading} error={profile.error} onRetry={profile.reload} />
      )}
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const weak = !STRONG.test(next);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!current || weak) return;
    setBusy(true);
    const r = await account.changePassword(current, next);
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setCurrent("");
    setNext("");
    setTried(false);
    setNotice({ text: "Password changed. Your other devices have been signed out.", tone: "ok" });
  };

  return (
    <form className="cm-form kh-card st-card" onSubmit={submit} noValidate>
      <h3>Change password</h3>
      <div className="cm-field">
        <label htmlFor="st-pw-now">Current password</label>
        <input id="st-pw-now" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={tried && !current ? true : undefined} />
      </div>
      <div className="cm-field">
        <label htmlFor="st-pw-new">New password</label>
        <input id="st-pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={tried && weak ? true : undefined} />
        <span className={tried && weak ? "cm-err" : "cm-small"}>{STRONG_HINT}</span>
      </div>
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
      <button className="kh-btn primary st-save" type="submit" disabled={busy}>{busy ? "Changing…" : "Change password"}</button>
    </form>
  );
}

function TwoStep({ enabled, email, onChange }: { enabled: boolean; email: string; onChange: (on: boolean) => void }) {
  const [stage, setStage] = useState<"idle" | "code">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  const sendCode = async () => {
    setBusy(true);
    const r = await account.sendTwoStepCode();
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setStage("code");
    setNotice({ text: `We sent a 6-digit code to ${email}.`, tone: "ok" });
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await account.toggleTwoStep(code);
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    onChange(r.data.is_2fa_set);
    setStage("idle");
    setCode("");
    setNotice({ text: r.data.is_2fa_set ? "Two-step verification is on." : "Two-step verification is off.", tone: "ok" });
  };

  return (
    <div className="cm-form kh-card st-card">
      <h3>Two-step verification <em className={`st-tag${enabled ? " on" : ""}`}>{enabled ? "On" : "Off"}</em></h3>
      <p className="st-lead">When it&apos;s on, logging in also needs a code we email you, so a stolen password alone isn&apos;t enough.</p>
      {stage === "code" ? (
        <form onSubmit={confirm} className="cm-form" noValidate>
          <div className="cm-field">
            <label htmlFor="st-2fa">6-digit code</label>
            <input id="st-2fa" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} className="st-code" />
          </div>
          <span className="st-row">
            <button className="kh-btn primary" type="submit" disabled={busy || code.replace(/\D/g, "").length !== 6}>{enabled ? "Turn off" : "Turn on"}</button>
            <button className="kh-btn outline" type="button" onClick={() => { setStage("idle"); setNotice(null); }}>Cancel</button>
          </span>
        </form>
      ) : (
        <button className={`kh-btn ${enabled ? "outline" : "primary"} st-save`} onClick={sendCode} disabled={busy}>{busy ? "Sending code…" : enabled ? "Turn off two-step verification" : "Turn on two-step verification"}</button>
      )}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
