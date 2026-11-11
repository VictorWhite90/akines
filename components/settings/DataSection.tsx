"use client";

import { useState } from "react";
import { account } from "@/lib/api/account";
import { auth } from "@/lib/api/client";
import { SESSION_KEY } from "@/lib/session";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Block, Notice } from "./useLoad";

export default function DataSection() {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");

  const download = async () => {
    setBusy("export");
    const r = await account.exportData();
    setBusy(null);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `akines-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ text: "Your data has been downloaded.", tone: "ok" });
  };

  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("delete");
    const r = await account.deleteAccount(password);
    if (!r.ok) {
      setBusy(null);
      return setNotice({ text: r.message, tone: "bad" });
    }
    await auth("logout");
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("ak:me");
    } catch {}
    window.location.replace("/landing");
  };

  return (
    <div className="ch-set__stack">
      <Block title="Download your data" text="A copy of everything Akines holds about you: your profile, settings, devices, blocked members and account activity.">
        <div className="ch-set__acts"><Button variant="secondary" onClick={download} disabled={busy !== null}>{busy === "export" ? "Preparing…" : "Download my data"}</Button></div>
      </Block>

      <Block danger title="Delete your account" text={<>This erases your profile, contact details, photo and interests straight away and signs you out everywhere. It can&apos;t be undone. You can sign up again later with the same email and number.</>}>
        {confirming ? (
          <form className="ch-set__fields" onSubmit={remove} noValidate>
            <Field label="Your password">
              <Input id="st-del-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label="Type DELETE to confirm">
              <Input id="st-del-type" autoCapitalize="characters" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </Field>
            <div className="ch-set__acts">
              <Button variant="danger" type="submit" disabled={busy !== null || !password || typed.trim().toUpperCase() !== "DELETE"}>{busy === "delete" ? "Deleting…" : "Delete my account"}</Button>
              <Button variant="secondary" onClick={() => { setConfirming(false); setPassword(""); setTyped(""); }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="ch-set__acts"><Button variant="danger" onClick={() => setConfirming(true)}>Delete my account…</Button></div>
        )}
      </Block>
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
