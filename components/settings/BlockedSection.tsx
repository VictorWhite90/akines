"use client";

import { useState } from "react";
import { account, fullName } from "@/lib/api/account";
import { Notice, Status, useLoad } from "./useLoad";

export default function BlockedSection() {
  const blocks = useLoad(account.blocks);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  if (!blocks.data) return <Status loading={blocks.loading} error={blocks.error} onRetry={blocks.reload} />;

  const unblock = async (username: string) => {
    const r = await account.unblock(username);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    blocks.setData(blocks.data!.filter((m) => m.username !== username));
    setNotice({ text: `@${username} is unblocked.`, tone: "ok" });
  };

  return (
    <div className="cm-form">
      <p className="st-lead">Blocked members can&apos;t see your profile or contact you, and you won&apos;t see theirs. They aren&apos;t told.</p>
      {blocks.data.length === 0 ? (
        <p className="kh-none">You haven&apos;t blocked anyone.</p>
      ) : (
        <ul className="st-list">
          {blocks.data.map((m) => (
            <li key={m.user_id}>
              <span className="st-initial" aria-hidden>{fullName(m).charAt(0)}</span>
              <span><b>{fullName(m)}</b><small>@{m.username}</small></span>
              {m.username && <button className="kh-btn outline sm" onClick={() => unblock(m.username!)}>Unblock</button>}
            </li>
          ))}
        </ul>
      )}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
