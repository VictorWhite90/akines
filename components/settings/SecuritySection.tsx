"use client";

import { useState } from "react";
import { account, type MyProfile } from "@/lib/api/account";
import { GOOGLE_ENABLED } from "@/lib/google";
import GoogleButton from "@/components/auth/GoogleButton";
import { STRONG, STRONG_HINT } from "@/components/auth/LoginScreen";
import Button from "@/components/kin/Button";
import { Tag } from "@/components/kin/Chip";
import { Field, Input } from "@/components/kin/Field";
import { Block, Notice, Status, useLoad } from "./useLoad";

export default function SecuritySection() {
  const profile = useLoad(account.profile);
  return (
    <div className="ch-set__stack">
      <PasswordForm />
      {profile.data ? (
        <>
          <TwoStep enabled={profile.data.is_2fa_set} email={profile.data.email} onChange={(on) => profile.setData({ ...profile.data!, is_2fa_set: on })} />
          <GoogleLink profile={profile.data} onChange={(link) => profile.setData({ ...profile.data!, ...link })} />
        </>
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
    <Block title="Change password">
      <form className="ch-set__fields" onSubmit={submit} noValidate>
        <Field label="Current password">
          <Input id="st-pw-now" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} invalid={tried && !current} />
        </Field>
        <Field label="New password" hint={tried && weak ? undefined : STRONG_HINT} error={tried && weak ? STRONG_HINT : undefined}>
          <Input id="st-pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Notice text={notice?.text ?? null} tone={notice?.tone} />
        <div className="ch-set__acts"><Button type="submit" disabled={busy}>{busy ? "Changing…" : "Change password"}</Button></div>
      </form>
    </Block>
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
    <Block title="Two-step verification" tag={<Tag tone={enabled ? "success" : "neutral"}>{enabled ? "On" : "Off"}</Tag>} text={<>When it&apos;s on, logging in also needs a code we email you, so a stolen password alone isn&apos;t enough.</>}>
      {stage === "code" ? (
        <form onSubmit={confirm} className="ch-set__fields" noValidate>
          <Field label="6-digit code">
            <Input id="st-2fa" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <div className="ch-set__acts">
            <Button type="submit" disabled={busy || code.replace(/\D/g, "").length !== 6}>{enabled ? "Turn off" : "Turn on"}</Button>
            <Button variant="secondary" onClick={() => { setStage("idle"); setNotice(null); }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="ch-set__acts"><Button variant={enabled ? "secondary" : "primary"} onClick={sendCode} disabled={busy}>{busy ? "Sending code…" : enabled ? "Turn off two-step verification" : "Turn on two-step verification"}</Button></div>
      )}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </Block>
  );
}

/** Continue with Google: link a Google account to log in with it, or unlink it (only while a password is set). */
function GoogleLink({ profile, onChange }: { profile: MyProfile; onChange: (link: Pick<MyProfile, "google" | "has_password">) => void }) {
  const linked = !!profile.google?.linked;
  const hasPassword = profile.has_password !== false;
  /** The credential from Google, waiting for the password that confirms it's the member linking it. */
  const [credential, setCredential] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  const link = async (googleCredential: string, pw?: string) => {
    setBusy(true);
    const r = await account.linkGoogle(googleCredential, pw);
    setBusy(false);
    if (!r.ok) {
      // A wrong password keeps the form open; anything else (expired, linked elsewhere) needs Google again.
      if (!/password/i.test(r.message)) { setCredential(null); setPassword(""); }
      return setNotice({ text: r.message, tone: "bad" });
    }
    setCredential(null);
    setPassword("");
    onChange(r.data);
    setNotice({ text: r.message ?? "Google is linked.", tone: "ok" });
  };

  const gotCredential = (c: string) => {
    setNotice(null);
    if (!hasPassword) return void link(c);
    setCredential(c);
  };

  const unlink = async () => {
    setBusy(true);
    const r = await account.unlinkGoogle();
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    onChange(r.data);
    setNotice({ text: r.message ?? "Google is unlinked.", tone: "ok" });
  };

  const text = linked
    ? <>You can log in with Google{profile.google?.email ? <> ({profile.google.email})</> : null}.{hasPassword ? null : <> Your account has no password yet: to unlink Google, first set one with Forgot password on the log-in screen.</>}</>
    : GOOGLE_ENABLED ? <>Link your Google account to log in with it instead of your password.</> : <>Linking Google isn&apos;t available yet.</>;

  return (
    <Block title="Google" tag={<Tag tone={linked ? "success" : "neutral"}>{linked ? "Linked" : "Not linked"}</Tag>} text={text}>
      {linked ? (
        <div className="ch-set__acts"><Button variant="secondary" onClick={() => void unlink()} disabled={busy || !hasPassword}>{busy ? "Unlinking…" : "Unlink Google"}</Button></div>
      ) : !GOOGLE_ENABLED ? null : credential ? (
        <form className="ch-set__fields" noValidate onSubmit={(e) => { e.preventDefault(); if (password) void link(credential, password); else setNotice({ text: "Enter your password to link Google.", tone: "bad" }); }}>
          <Field label="Your password" hint="To confirm it's you linking Google.">
            <Input id="st-google-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="ch-set__acts">
            <Button type="submit" disabled={busy}>{busy ? "Linking…" : "Link Google"}</Button>
            <Button variant="secondary" onClick={() => { setCredential(null); setPassword(""); setNotice(null); }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="ch-set__acts ch-set__google">
          <GoogleButton label="Link Google" busy={busy} onCredential={gotCredential} onNotice={(t) => setNotice({ text: t, tone: "bad" })} unavailable="Linking Google isn't available yet." />
        </div>
      )}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </Block>
  );
}
