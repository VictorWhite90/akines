"use client";

import { useEffect, useState } from "react";
import { SearchNormal1, TickCircle } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { fullName } from "@/lib/api/account";
import type { ApiResult } from "@/lib/api/client";
import { communities, type InviteCandidate } from "@/lib/api/community";
import QR from "./QR";
import Sheet from "./Sheet";

type Tab = "people" | "link";

/** Invite people already on Akines (with Accept on their side), or share the link and QR code for everyone else. */
export default function InviteSheet({ communityId, name, inviteCode, leader, onRotate, onClose }: { communityId: string; name: string; inviteCode: string; leader: boolean; onRotate: () => Promise<boolean>; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("people");
  return (
    <Sheet title="Invite people" sub={tab === "people" ? "Invite people you know on Akines. They'll get an invitation to accept." : "For people who aren't on Akines yet: share on WhatsApp, Instagram or at your next meet-up."} onClose={onClose}>
      <div className="cm-seg cm-invite-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "people"} className={tab === "people" ? "on" : undefined} onClick={() => setTab("people")}>People on Akines</button>
        <button role="tab" aria-selected={tab === "link"} className={tab === "link" ? "on" : undefined} onClick={() => setTab("link")}>Share a link</button>
      </div>
      {tab === "people" ? <PeoplePicker suggest={(q) => communities.inviteSuggestions(communityId, q)} send={(ids) => communities.sendInvites(communityId, ids)} /> : <ShareLink name={name} inviteCode={inviteCode} leader={leader} onRotate={onRotate} />}
    </Sheet>
  );
}

type SendResult = { invited: number; results: { user_id: string; status: string }[] };

/** Pick people already on Akines and send them invites (to a community, or a small circle). */
export function PeoplePicker({ suggest, send: sendTo, empty = "People you share a community with will show here. You can also search by @username.", limit }: {
  suggest: (search: string) => Promise<ApiResult<InviteCandidate[]>>;
  send: (userIds: string[]) => Promise<ApiResult<SendResult>>;
  empty?: string;
  /** Most people that can be picked at once (e.g. the seats left in a circle). */
  limit?: number;
}) {
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<InviteCandidate[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await suggest(search.trim());
      if (r.ok) setPeople(r.data);
      else setNotice({ text: r.message, tone: "bad" });
    }, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `suggest` is a fresh arrow each render; search drives it
  }, [search]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : limit !== undefined && p.length >= limit ? p : [...p, id]));

  const send = async () => {
    setBusy(true);
    const r = await sendTo(picked);
    setBusy(false);
    if (!r.ok) return setNotice({ text: r.message, tone: "bad" });
    const invited = new Set(r.data.results.filter((x) => x.status === "invited" || x.status === "already_invited").map((x) => x.user_id));
    setPeople((list) => list?.map((p) => (invited.has(p.user_id) ? { ...p, invited: true } : p)) ?? null);
    setPicked([]);
    const skipped = r.data.results.length - r.data.invited;
    setNotice({ text: `${r.data.invited} ${r.data.invited === 1 ? "invite" : "invites"} sent.${skipped ? ` ${skipped} couldn't be invited.` : ""}`, tone: "ok" });
  };

  return (
    <div className="cm-people-pick">
      <label className="cm-searchbox"><SearchNormal1 size={16} color="currentColor" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or @username" aria-label="Search people" autoCapitalize="none" /></label>
      {people === null ? (
        <p className="kh-none" aria-busy="true">Loading…</p>
      ) : people.length === 0 ? (
        <p className="kh-none">{search ? "No one found. Try their exact @username." : empty}</p>
      ) : (
        <ul className="cm-pick-list">
          {people.map((p) => {
            const on = picked.includes(p.user_id);
            return (
              <li key={p.user_id}>
                <button type="button" className={on ? "on" : undefined} onClick={() => !p.invited && toggle(p.user_id)} disabled={p.invited} aria-pressed={on}>
                  <Avatar person={{ name: fullName(p), photo: p.profile_photo }} size={40} />
                  <span><b>{fullName(p)}</b><small>{p.username ? `@${p.username}` : ""}</small></span>
                  {p.invited ? <em className="st-tag">Invited</em> : <TickCircle size={22} color="currentColor" variant={on ? "Bold" : "Linear"} className="cm-pick-tick" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {notice && <p className={`st-notice ${notice.tone}`} role="status">{notice.text}</p>}
      <button className="kh-btn amber cm-submit" onClick={send} disabled={busy || picked.length === 0}>{busy ? "Sending…" : picked.length ? `Send ${picked.length} ${picked.length === 1 ? "invite" : "invites"}` : "Choose people to invite"}</button>
    </div>
  );
}

function ShareLink({ name, inviteCode, leader, onRotate }: { name: string; inviteCode: string; leader: boolean; onRotate: () => Promise<boolean> }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/circles/join/${inviteCode}` : `/circles/join/${inviteCode}`;
  const [copied, setCopied] = useState("");
  const [rotating, setRotating] = useState(false);
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("Select the text to copy it");
    }
  };
  const rotate = async () => {
    if (!window.confirm("Make a new invite link? The current link and code will stop working.")) return;
    setRotating(true);
    const ok = await onRotate();
    setRotating(false);
    setCopied(ok ? "New link ready. The old one no longer works." : "Couldn't make a new link. Try again.");
  };
  const message = `Join ${name} on Akines: ${link}`;
  return (
    <div className="cm-invite">
      <QR value={link} size={180} label={`QR code to join ${name}`} />
      <div className="cm-invite-tx">
        <label className="cm-l" htmlFor="cm-invite-link">Invite link</label>
        <input id="cm-invite-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        <div className="cm-row">
          <button className="kh-btn amber sm" onClick={() => copy(link, "Link copied")}>Copy link</button>
          <button className="kh-btn outline sm" onClick={() => copy(message, "Message copied")}>Copy WhatsApp message</button>
          <a className="kh-btn outline sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
        </div>
        <p className="cm-small">Invite code <b>{inviteCode}</b>. People can also type it on the join page.</p>
        {leader && <button className="cm-leave" onClick={rotate} disabled={rotating}>{rotating ? "Making a new link…" : "Link shared too widely? Make a new one"}</button>}
        {copied && <p className="cm-ok" role="status">{copied}</p>}
      </div>
    </div>
  );
}
