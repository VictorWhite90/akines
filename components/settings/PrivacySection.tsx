"use client";

import { useState } from "react";
import { account, type MyProfile } from "@/lib/api/account";
import { Notice, Status, useLoad } from "./useLoad";

const WHO: { value: MyProfile["message_permission"]; label: string; hint: string }[] = [
  { value: "everyone", label: "Everyone on Akines", hint: "Any member can start a conversation with you." },
  { value: "circles", label: "People in my circles", hint: "Only people who share a KinCircle or community with you." },
  { value: "nobody", label: "Nobody", hint: "No one can start a new conversation. Existing ones stay." },
];

export default function PrivacySection() {
  const profile = useLoad(account.profile);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  if (!profile.data) return <Status loading={profile.loading} error={profile.error} onRetry={profile.reload} />;
  const p = profile.data;

  const change = async (changes: Partial<MyProfile>) => {
    const before = p;
    profile.setData({ ...p, ...changes });
    const r = await account.updateProfile(changes);
    if (!r.ok) {
      profile.setData(before);
      return setNotice({ text: r.message, tone: "bad" });
    }
    setNotice({ text: "Saved.", tone: "ok" });
  };

  return (
    <div className="cm-form">
      <fieldset className="st-group">
        <legend>Who can message you</legend>
        {WHO.map((w) => (
          <label key={w.value} className="cm-check st-radio">
            <input type="radio" name="who" checked={p.message_permission === w.value} onChange={() => change({ message_permission: w.value })} />
            <span><b>{w.label}</b><small>{w.hint}</small></span>
          </label>
        ))}
      </fieldset>

      <fieldset className="st-group">
        <legend>Discovery</legend>
        <label className="cm-check st-radio">
          <input type="checkbox" checked={p.show_in_search} onChange={(e) => change({ show_in_search: e.target.checked })} />
          <span><b>Show me in search and suggestions</b><small>Turn off to only be found by people who already know your @username.</small></span>
        </label>
      </fieldset>

      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
