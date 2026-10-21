"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { fullName } from "@/lib/api/account";
import { CIRCLE_KINDS, circles, type Community, type SmallCircle } from "@/lib/api/community";
import CircleForm from "./CircleForm";

export const circleHref = (c: { community_id: string; id: string }) => `/circles/community/${c.community_id}/circles/${c.id}`;
export const kindGlyph = (kind: string) => CIRCLE_KINDS.find((k) => k.value === kind)?.glyph ?? "◎";

/** The community's small circles: yours first, then open ones with a seat. Members can start one. */
export default function SmallCircles({ c, startOpen }: { c: Community; startOpen?: boolean }) {
  const router = useRouter();
  const [list, setList] = useState<SmallCircle[] | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(!!startOpen && !!c.my_role);
  const [busy, setBusy] = useState<string | null>(null);
  const member = !!c.my_role;

  const load = useCallback(async (p: number) => {
    const r = await circles.list(c.id, p);
    if (!r.ok) return setError(r.message);
    setList((cur) => (p === 1 ? r.data : [...(cur ?? []), ...r.data]));
    setMore(r.data.length === 20);
    setPage(p);
  }, [c.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the circles when the tab opens
    void load(1);
  }, [load]);

  const join = async (s: SmallCircle) => {
    setBusy(s.id);
    const r = s.my_invitation ? await circles.respondInvite(s.my_invitation, "accept") : await circles.join(c.id, s.id);
    setBusy(null);
    if (!r.ok) return setError(r.message);
    router.push(circleHref(s));
  };

  return (
    <section className="cm-sec sc">
      <div className="kh-card sc-intro">
        <div>
          <h2>Small circles</h2>
          <p>3 to 8 people from {c.name} with one purpose and their own group chat: a study group, a Sunday five-a-side, a book swap.</p>
        </div>
        {member ? <button className="kh-btn amber" onClick={() => setStarting(true)}>＋ Start a small circle</button> : <p className="cm-small">Join the community to start or join a circle.</p>}
      </div>

      {error && <p className="st-notice bad" role="alert">{error}</p>}
      {list === null ? (
        <p className="kh-none" aria-busy="true">Loading circles…</p>
      ) : list.length === 0 ? (
        <div className="kh-card cm-none">
          <h3>No small circles yet</h3>
          <p>{member ? "Start the first one. Pick a purpose, a size, and invite a few people you'd like to know better." : "When members start circles, they'll show here."}</p>
        </div>
      ) : (
        <ul className="sc-grid">
          {list.map((s) => {
            const seats = s.capacity - s.member_count;
            const host = s.members.find((m) => m.role === "host");
            return (
              <li key={s.id} className="sc-card">
                <Link href={circleHref(s)} className="sc-card-main">
                  <span className="sc-kind"><i aria-hidden>{kindGlyph(s.kind)}</i>{s.kind_label}{s.join_mode === "invite" && " · Invite only"}</span>
                  <b>{s.name}</b>
                  {s.purpose && <p>{s.purpose}</p>}
                  <span className="sc-people">
                    <span className="sc-faces">{s.members.slice(0, 5).map((m) => <Avatar key={m.user.user_id} person={{ name: fullName(m.user), photo: m.user.profile_photo }} size={26} />)}</span>
                    <small>{s.member_count} of {s.capacity}{host ? ` · hosted by ${host.user.first_name}` : ""}</small>
                  </span>
                </Link>
                <div className="sc-card-foot">
                  {s.my_role ? (
                    <>
                      <span className="cm-chip ok">{s.my_role === "host" ? "You host" : "You're in"}</span>
                      <Link href={circleHref(s)} className="kh-btn amber sm">Open chat</Link>
                    </>
                  ) : s.my_invitation ? (
                    <>
                      <span className="cm-chip">You&apos;re invited</span>
                      <button className="kh-btn amber sm" onClick={() => join(s)} disabled={busy === s.id || s.is_full}>{s.is_full ? "Full" : busy === s.id ? "Joining…" : "Accept"}</button>
                    </>
                  ) : s.is_full ? (
                    <span className="cm-chip">Full</span>
                  ) : s.join_mode === "invite" ? (
                    <span className="cm-chip">{seats} {seats === 1 ? "seat" : "seats"} · invite only</span>
                  ) : (
                    <>
                      <span className="cm-chip">{seats} {seats === 1 ? "seat" : "seats"} left</span>
                      {member && <button className="kh-btn amber sm" onClick={() => join(s)} disabled={busy === s.id}>{busy === s.id ? "Joining…" : "Join"}</button>}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {more && <button className="kh-btn outline sc-more" onClick={() => load(page + 1)}>Show more circles</button>}

      {starting && (
        <CircleForm communityName={c.name} onClose={() => setStarting(false)} onSave={async (input) => {
          const r = await circles.create(c.id, input);
          if (!r.ok) return r;
          router.push(`${circleHref(r.data)}?invite=1`);
          return { ok: true };
        }} />
      )}
    </section>
  );
}
