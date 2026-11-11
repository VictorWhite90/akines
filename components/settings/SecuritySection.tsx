"use client";

import { useState } from "react";
import { account } from "@/lib/api/account";
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
