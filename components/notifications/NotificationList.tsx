"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { circles, communities } from "@/lib/api/community";
import { notifications, type Notice } from "@/lib/api/notifications";

export function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h`;
  if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** The member's notifications: invites can be answered in place; anything else opens what it's about. */
export default function NotificationList({ compact = false, onNavigate, onChange }: { compact?: boolean; onNavigate?: () => void; onChange?: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<Notice[] | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    const r = await notifications.list(p);
    if (!r.ok) return setError(r.message);
    setItems((prev) => (p === 1 || !prev ? r.data : [...prev, ...r.data]));
    setMore(r.data.length === 20);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the list opens or pages
    void load(page);
  }, [load, page]);

  const open = async (n: Notice) => {
    if (!n.is_read) {
      setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) ?? null);
      await notifications.markRead([n.id]);
      onChange?.();
    }
    onNavigate?.();
    if (n.link) router.push(n.link);
  };

  const answer = async (n: Notice, decision: "accept" | "decline") => {
    setBusy(n.id);
    const circle = n.kind === "circle_invite";
    const r = circle ? await circles.respondInvite(Number(n.target_id), decision) : await communities.respondInvite(Number(n.target_id), decision);
    setBusy(null);
    if (!r.ok) return setError(r.message);
    setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, is_read: true, text: decision === "accept" ? `${x.text} You joined.` : `${x.text} You declined.`, kind: "invite_accepted" } : x)) ?? null);
    onChange?.();
    if (decision === "accept" && typeof r.data === "object" && r.data) {
      onNavigate?.();
      router.push(circle ? n.link : `/circles/community/${(r.data as { id: string }).id}`);
    }
  };

  const markAll = async () => {
    await notifications.markRead();
    setItems((list) => list?.map((x) => ({ ...x, is_read: true })) ?? null);
    onChange?.();
  };

  if (error && !items) return <p className="nt-empty" role="alert">{error}</p>;
  if (!items) return <p className="nt-empty" aria-busy="true">Loading…</p>;

  const unread = items.some((x) => !x.is_read);

  return (
    <div className={`nt-list${compact ? " compact" : ""}`}>
      {unread && <button className="nt-mark" onClick={markAll}>Mark all as read</button>}
      {items.length === 0 ? (
        <div className="nt-empty">
          <b>Nothing yet</b>
          <p>Invitations, join requests and news from your communities will show up here.</p>
        </div>
      ) : (
        <ul>
          {items.map((n) => {
            const name = n.actor ? [n.actor.first_name, n.actor.last_name].filter(Boolean).join(" ") || n.actor.username || "Someone" : "Akines";
            const pendingInvite = (n.kind === "community_invite" || n.kind === "circle_invite") && !n.is_read;
            return (
              <li key={n.id} className={n.is_read ? undefined : "unread"}>
                <button className="nt-row" onClick={() => open(n)}>
                  <Avatar person={{ name, photo: n.actor?.profile_photo }} size={40} />
                  <span className="nt-tx">
                    <span>{n.text}</span>
                    <small>{timeAgo(n.created_at)}</small>
                  </span>
                  {!n.is_read && <i className="nt-dot" aria-label="Unread" />}
                </button>
                {pendingInvite && (
                  <span className="nt-acts">
                    <button className="kh-btn amber sm" onClick={() => answer(n, "accept")} disabled={busy === n.id}>Accept</button>
                    <button className="kh-btn outline sm" onClick={() => answer(n, "decline")} disabled={busy === n.id}>Decline</button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {more && <button className="nt-more" onClick={() => setPage((p) => p + 1)}>Show more</button>}
      {compact && <Link href="/notifications" className="nt-all" onClick={onNavigate}>See all notifications</Link>}
    </div>
  );
}
