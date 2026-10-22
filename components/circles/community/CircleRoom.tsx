"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import LiveThread from "@/components/chat/LiveThread";
import { Ico } from "@/components/chat/bits";
import { useMe } from "@/components/shell/MemberContext";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import { fullName } from "@/lib/api/account";
import { chat, type ConversationMember } from "@/lib/api/chat";
import { circles, type SmallCircle } from "@/lib/api/community";
import CircleForm from "./CircleForm";
import { PeoplePicker } from "./InviteSheet";
import Sheet from "./Sheet";
import KindIcon from "./KindIcon";

/** A small circle: its live group chat, and (beside it, or behind "i" on phones) who's in it and what it's for. */
export default function CircleRoom({ communityId, circleId, openInvite }: { communityId: string; circleId: string; openInvite?: boolean }) {
  const router = useRouter();
  const { me } = useMe();
  const [s, setS] = useState<SmallCircle | null>(null);
  const [gone, setGone] = useState<string | null>(null);
  const [chatMembers, setChatMembers] = useState<ConversationMember[]>([]);
  const [chatClosed, setChatClosed] = useState(false);
  const [info, setInfo] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const back = `/circles/community/${communityId}?tab=circles`;

  const load = useCallback(async () => {
    const r = await circles.get(communityId, circleId);
    if (!r.ok) return setGone(r.status === 404 ? "This circle has closed, or the link is incomplete." : r.message);
    setS(r.data);
    if (r.data.conversation_id) {
      const conv = await chat.conversation(r.data.conversation_id);
      if (conv.ok) {
        setChatMembers(conv.data.members ?? []);
        setChatClosed(conv.data.is_closed);
      }
    }
  }, [communityId, circleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the circle when the page opens
    void load();
  }, [load]);

  // Arriving from "Start circle": open the invite sheet once, then tidy the address.
  useEffect(() => {
    if (!openInvite || s?.my_role !== "host") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open once, when the new circle has loaded
    setInviting(true);
    router.replace(`/circles/community/${communityId}/circles/${circleId}`, { scroll: false });
  }, [openInvite, s?.my_role, router, communityId, circleId]);

  // Someone joined or left: refresh the member list (once, even if several lines arrive together).
  const membersChanged = useCallback(() => {
    clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => void load(), 600);
  }, [load]);
  useEffect(() => () => clearTimeout(reloadTimer.current), []);

  if (gone) {
    return (
      <div className="kh cm-empty">
        <h1>Circle not available</h1>
        <p>{gone}</p>
        <Link href={back} className="kh-btn amber">Back to the community</Link>
      </div>
    );
  }
  if (!s) return <div className="kh cm cm-loading" aria-busy="true"><span className="cm-hero-ph" /></div>;

  const host = s.my_role === "host";
  const inCircle = !!s.my_role;
  const hostIds = s.members.filter((m) => m.role === "host").map((m) => m.user.user_id);
  const seats = s.capacity - s.member_count;

  const join = async () => {
    setBusy(true);
    const r = s.my_invitation ? await circles.respondInvite(s.my_invitation, "accept") : await circles.join(communityId, circleId);
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    await load();
  };
  const decline = async () => {
    if (!s.my_invitation) return;
    const r = await circles.respondInvite(s.my_invitation, "decline");
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    setS({ ...s, my_invitation: null });
  };
  const leave = async () => {
    if (!window.confirm(host && s.member_count > 1 ? `Leave ${s.name}? The person who's been in it longest becomes host.` : `Leave ${s.name}?`)) return;
    const r = await circles.leave(communityId, circleId);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    router.push(back);
  };
  const close = async () => {
    if (!window.confirm(`Close ${s.name} for everyone? The chat stays readable, but no one can send messages.`)) return;
    const r = await circles.close(communityId, circleId);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    router.push(back);
  };
  const remove = async (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the circle?`)) return;
    const r = await circles.removeMember(communityId, circleId, userId);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    void load();
  };

  return (
    <div className="rs cs sc-room kh">
      <section className="rs-main">
        <header className="rs-head">
          <BackLink fallback={back} className="back" aria-label="Back to the community">←</BackLink>
          <div className="thumb sc-thumb" aria-hidden><KindIcon kind={s.kind} size={22} /></div>
          <div className="who">
            <h1>{s.name}</h1>
            <p>{s.member_count} of {s.capacity} · <Link href={`/circles/community/${communityId}`}>{s.community_name}</Link></p>
          </div>
          <div className="acts">
            {inCircle && !chatClosed && seats > 0 && <button className="go" onClick={() => setInviting(true)}><Ico n="plus" size={16} /> <span className="lbl">Invite</span></button>}
            <button className="ic show-sm" onClick={() => setInfo((v) => !v)} aria-label="Circle info"><Ico n="info" /></button>
          </div>
        </header>
        {notice && <p className={`st-notice ${notice.tone} sc-notice`} role={notice.tone === "bad" ? "alert" : "status"}>{notice.text}</p>}

        {inCircle && s.conversation_id ? (
          <LiveThread conversationId={s.conversation_id} members={chatMembers} hostIds={hostIds} closed={chatClosed} placeholder="Write a message…" onMembersChanged={membersChanged} />
        ) : (
          <div className="rs-msgs sc-gate">
            <div className="kh-card">
              <span className="sc-kind"><KindIcon kind={s.kind} size={14} />{s.kind_label}</span>
              <h2>{s.name}</h2>
              {s.purpose && <p className="cm-pre">{s.purpose}</p>}
              {s.my_invitation ? (
                <>
                  <p><b>You&apos;re invited.</b> Join to see the chat and meet the others.</p>
                  <div className="st-row">
                    <button className="kh-btn amber" onClick={join} disabled={busy || s.is_full}>{s.is_full ? "Circle is full" : busy ? "Joining…" : "Accept and join"}</button>
                    <button className="kh-btn outline" onClick={decline}>Decline</button>
                  </div>
                </>
              ) : s.is_full ? (
                <p>This circle is full. Ask the host if a seat opens up, or start your own.</p>
              ) : s.join_mode === "invite" ? (
                <p>This circle is invite only. Ask someone in it to invite you.</p>
              ) : (
                <>
                  <p>{seats} {seats === 1 ? "seat" : "seats"} left. Join to see the chat and say hello.</p>
                  <button className="kh-btn amber" onClick={join} disabled={busy}>{busy ? "Joining…" : "Join circle"}</button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <aside className={`rs-side${info ? " open" : ""}`}>
        <button className="close show-sm" onClick={() => setInfo(false)} aria-label="Close">×</button>
        <div className="about">
          <span className="sc-kind"><KindIcon kind={s.kind} size={14} />{s.kind_label}{s.join_mode === "invite" ? " · Invite only" : " · Open to members"}</span>
          <h2>{s.name}</h2>
          {s.purpose ? <p className="blurb cm-pre">{s.purpose}</p> : host && <p className="blurb">Add a line about what this circle is for, so people know if it&apos;s for them.</p>}
        </div>

        {s.agreements.length > 0 && (
          <div className="blk">
            <h3>We agree</h3>
            <ul className="sc-agreed">{s.agreements.map((a) => <li key={a}>✓ {a}</li>)}</ul>
          </div>
        )}

        <div className="blk">
          <h3>In this circle <small>{s.member_count} of {s.capacity}</small></h3>
          <ul className="people">
            {s.members.map((m) => {
              const name = fullName(m.user);
              const isMe = m.user.user_id === me?.id;
              return (
                <li key={m.user.user_id}>
                  <Avatar person={{ name, photo: m.user.profile_photo }} size={34} />
                  <div>
                    <b>{m.user.username ? <Link href={`/u/${m.user.username}`}>{isMe ? `${name} (you)` : name}</Link> : isMe ? `${name} (you)` : name}</b>
                    <small>{m.user.username ? `@${m.user.username}` : "Member"}</small>
                  </div>
                  {m.role === "host" && <em className="tag">Host</em>}
                  {host && !isMe && !chatClosed && <button className="sc-x" onClick={() => remove(m.user.user_id, name)} aria-label={`Remove ${name}`}>Remove</button>}
                </li>
              );
            })}
            {Array.from({ length: Math.max(0, seats) }).map((_, i) => <li key={`seat-${i}`} className="sc-seat"><span aria-hidden>＋</span><div><small>Open seat</small></div></li>)}
          </ul>
        </div>

        {inCircle && (
          <div className="blk sc-acts">
            {!chatClosed && seats > 0 && <button className="kh-btn amber sm" onClick={() => setInviting(true)}>Invite people</button>}
            {host && !chatClosed && <button className="kh-btn outline sm" onClick={() => setEditing(true)}>Edit circle</button>}
            <button className="cm-leave" onClick={leave}>Leave circle</button>
            {s.can_close && !chatClosed && <button className="cm-leave sc-danger" onClick={close}>Close circle</button>}
          </div>
        )}
        {!inCircle && s.can_close && <div className="blk sc-acts"><button className="cm-leave sc-danger" onClick={close}>Close circle (community leader)</button></div>}
        <p className="promise">Only people in this circle can read its chat.</p>
      </aside>
      {info && <div className="rs-scrim show-sm" onClick={() => setInfo(false)} aria-hidden />}

      {inviting && (
        <Sheet title={`Invite to ${s.name}`} sub={`People from ${s.community_name}. ${seats} ${seats === 1 ? "seat" : "seats"} left.`} onClose={() => setInviting(false)}>
          <PeoplePicker
            suggest={(q) => circles.inviteSuggestions(communityId, circleId, q)}
            send={(ids) => circles.sendInvites(communityId, circleId, ids)}
            empty={`Everyone in ${s.community_name} who isn't in the circle yet shows here. Search by name or @username.`}
            limit={Math.max(0, seats)}
          />
        </Sheet>
      )}
      {editing && (
        <CircleForm communityName={s.community_name} circle={s} onClose={() => setEditing(false)} onSave={async (input) => {
          const r = await circles.update(communityId, circleId, input);
          if (!r.ok) return r;
          setS(r.data);
          setEditing(false);
          return { ok: true };
        }} />
      )}
    </div>
  );
}
