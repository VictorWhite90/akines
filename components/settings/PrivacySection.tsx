"use client";

import { useState } from "react";
import { Chip } from "@/components/kin/Chip";
import { Toggle } from "@/components/kin/Choice";
import { account, type MyProfile } from "@/lib/api/account";
import { PrivacyExtras } from "./ConnectionSections";
import { Notice, Status, useLoad } from "./useLoad";

const WHO: { value: MyProfile["message_permission"]; label: string }[] = [
  { value: "everyone", label: "Everyone on Akines" },
  { value: "circles", label: "People in my circles" },
  { value: "nobody", label: "Nobody" },
];

/** Who can message you and whether you appear in search (saved to the API as you change them), then the design's privacy rows. */
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
    <>
      <div className="ch-set__group">
        <p className="ch-label">Who can message me</p>
        <div className="ch-chips" role="radiogroup" aria-label="Who can message me">
          {WHO.map((w) => <Chip key={w.value} variant="choice" selected={p.message_permission === w.value} onClick={() => change({ message_permission: w.value })}>{w.label}</Chip>)}
        </div>
      </div>
      <div className="ch-set__list">
        <div className="ch-set__row">
          <div className="ch-set__rowtext"><span className="ch-set__rowtitle">Show me in search and suggestions</span><span className="ch-set__rowdesc">Turn off to only be found by people who already know your @username.</span></div>
          <Toggle checked={p.show_in_search} onChange={(v) => change({ show_in_search: v })} aria-label="Show me in search and suggestions" />
        </div>
      </div>
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
      <PrivacyExtras />
    </>
  );
}
