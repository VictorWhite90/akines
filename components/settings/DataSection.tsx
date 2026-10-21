"use client";

import { useState } from "react";
import { account } from "@/lib/api/account";
import { auth } from "@/lib/api/client";
import { SESSION_KEY } from "@/lib/session";
import { Notice } from "./useLoad";

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
    } catch {}
    window.location.replace("/about");
  };

  return (
    <div className="st-stack">
      <div className="cm-form kh-card st-card">
        <h3>Download your data</h3>
        <p className="st-lead">A copy of everything Akines holds about you: your profile, settings, devices, blocked members and account activity.</p>
        <button className="kh-btn outline st-save" onClick={download} disabled={busy !== null}>{busy === "export" ? "Preparing…" : "Download my data"}</button>
      </div>

      <div className="cm-form kh-card st-card st-danger">
        <h3>Delete your account</h3>
        <p className="st-lead">This erases your profile, contact details, photo and interests straight away and signs you out everywhere. It can&apos;t be undone. You can sign up again later with the same email and number.</p>
        {confirming ? (
          <form className="cm-form" onSubmit={remove} noValidate>
            <div className="cm-field">
              <label htmlFor="st-del-pw">Your password</label>
              <input id="st-del-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="cm-field">
              <label htmlFor="st-del-type">Type DELETE to confirm</label>
              <input id="st-del-type" autoCapitalize="characters" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </div>
            <span className="st-row">
              <button className="kh-btn st-delete" type="submit" disabled={busy !== null || !password || typed.trim().toUpperCase() !== "DELETE"}>{busy === "delete" ? "Deleting…" : "Delete my account"}</button>
              <button className="kh-btn outline" type="button" onClick={() => { setConfirming(false); setPassword(""); setTyped(""); }}>Cancel</button>
            </span>
          </form>
        ) : (
          <button className="kh-btn outline st-save st-danger-btn" onClick={() => setConfirming(true)}>Delete my account…</button>
        )}
      </div>
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
