"use client";

import { useState } from "react";
import { account, fullName } from "@/lib/api/account";
import Avatar from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Notice, Status, useLoad } from "./useLoad";

export default function BlockedSection() {
  const blocks = useLoad(account.blocks);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  // The list comes a page (10) at a time; a full page means there may be more.
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  if (!blocks.data) return <Status loading={blocks.loading} error={blocks.error} onRetry={blocks.reload} />;

  const unblock = async (username: string) => {
    const r = await account.unblock(username);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    blocks.setData(blocks.data!.filter((m) => m.username !== username));
    setNotice({ text: `@${username} is unblocked.`, tone: "ok" });
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const r = await account.blocks(page + 1);
    setLoadingMore(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    const seen = new Set(blocks.data!.map((m) => m.user_id));
    blocks.setData([...blocks.data!, ...r.data.filter((m) => !seen.has(m.user_id))]);
    setPage(page + 1);
    if (r.data.length < 10) setMore(false);
  };

  return (
    <div className="ch-set__stack">
      <p className="ch-set__blocktext">Blocked members can&apos;t see your profile or contact you, and you won&apos;t see theirs. They aren&apos;t told.</p>
      {blocks.data.length === 0 ? (
        <p className="ch-set__rowdesc">You haven&apos;t blocked anyone.</p>
      ) : (
        <div className="ch-set__list">
          {blocks.data.map((m) => (
            <div key={m.user_id} className="ch-set__row">
              <div className="ch-set__rowlead">
                <Avatar person={{ name: fullName(m) }} size={40} />
                <div className="ch-set__rowtext"><span className="ch-set__rowtitle">{fullName(m)}</span><span className="ch-set__rowdesc">@{m.username}</span></div>
              </div>
              {m.username && <Button variant="secondary" size="sm" onClick={() => unblock(m.username!)}>Unblock</Button>}
            </div>
          ))}
        </div>
      )}
      {more && blocks.data.length >= 10 * page ? (
        <div className="ch-set__acts"><Button variant="secondary" size="sm" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? "Loading…" : "Show more"}</Button></div>
      ) : null}
      <Notice text={notice?.text ?? null} tone={notice?.tone} />
    </div>
  );
}
