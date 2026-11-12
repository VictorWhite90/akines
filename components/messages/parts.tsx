"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import PlanCall, { type Plan } from "@/components/community/PlanCall";
import Button from "@/components/kin/Button";
import { photoSrc } from "@/components/kin/home/parts";
import type { KMsg } from "@/lib/data/kinmessage";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * The pieces of Messages, mirrored from the product design (classes in components/kin/community.css): the
 * conversation list, the open conversation with date groups and bubbles, and a one-line composer. Shared by the
 * sample-data version (demo) and the one that reads the Akines chat API, so both look the same.
 */

/** A line from Akines itself ("Ada joined the team"), or a message its sender took back. */
export type Shown = KMsg | { id: string; from: string; at: string; kind: "system" | "removed"; text: string };

/** Messages carry a time for today, or a day name for earlier: the day is the group heading. */
export const day = (at: string) => (/^\d{1,2}:\d{2}/.test(at) ? "Today" : at);

export function Face({ src, size }: { src?: string | null; size: number }) {
  return (
    <span className="ch-av" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- member or group photo */}
      {src ? <img src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </span>
  );
}

export function text(m: Shown): string {
  switch (m.kind) {
    case "text": return m.text;
    case "voice": return `Voice note · ${m.length}${m.text ? `. ${m.text}` : ""}`;
    case "photo": return m.text ?? "Shared a photo.";
    case "poll": return `${m.question} ${m.options.join(" · ")}`;
    case "invite": return [m.title, m.detail].filter(Boolean).join(". ");
    case "system": return m.text;
    case "removed": return "This message was removed.";
    default: return "";
  }
}

function Bubble({ m, me, group }: { m: Shown; me: string; group: boolean }) {
  if (m.kind === "spark") return null;
  if (m.kind === "system") return <p className="ch-date">{m.text}</p>;
  const out = m.from === me;
  const sender = group && !out ? (m.kind === "text" && m.sender) || PEOPLE[m.from as PersonId]?.name.split(" ")[0] : undefined;
  return (
    <div className={`ch-bub ch-bub--${out ? "out" : "in"}`}>
      <div className="ch-bub__col">
        {sender ? <span className="ch-bub__sender">{sender}</span> : null}
        {m.kind === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element -- a shared photo
          <img src={photoSrc(m.photo, 640)} alt="" style={{ width: "100%", maxWidth: 360, borderRadius: 12, marginBottom: 8 }} />
        ) : null}
        {m.kind === "invite" && m.href ? <p className="ch-bub__text"><Link href={m.href}>{text(m)}</Link></p> : <p className="ch-bub__text">{text(m)}</p>}
      </div>
    </div>
  );
}

export type Row = { id: string; name: string; desc: string; meta: string; face?: string | null; label?: string };

/** The conversation list. `onEnd` is called when it is scrolled near its end (to load the next page). */
export function ConvoList({ rows, openId, onEnd }: { rows: Row[]; openId?: string; onEnd?: () => void }) {
  return (
    <nav className="ch-msg__side" aria-label="Conversations">
      <h2 className="ch-msg__title">Messages</h2>
      <div
        className="ch-msg__list"
        onScroll={onEnd ? (e) => { const el = e.currentTarget; if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) onEnd(); } : undefined}
      >
        {rows.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`} className={openId === c.id ? "ch-row ch-row--on" : "ch-row"} aria-label={c.label}>
            <Face src={c.face} size={44} />
            <span className="ch-row__text"><span className="ch-row__title">{c.name}</span><span className="ch-row__desc">{c.desc}</span></span>
            <span className="ch-row__meta">{c.meta}</span>
            <span className="ch-row__chev"><ChevronRight size={16} strokeWidth={1.5} aria-hidden /></span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Nothing open: the design's empty pane. `quick` is the Quick Catch-up its button plans (the plan modal, as in the design). */
export function EmptyPane({ quick }: { quick?: Plan }) {
  const [planning, setPlanning] = useState(false);
  return (
    <div className="ch-msg__main">
      <div className="ch-msg__empty">
        <MessageCircle size={40} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} />
        <h1 className="ch-msg__empty-title">Choose a conversation</h1>
        <p className="ch-msg__empty-text">Pick someone from the list to continue, or start something new.</p>
        {quick ? <Button variant="secondary" onClick={() => setPlanning(true)}>Start a Quick Catch-up</Button> : null}
      </div>
      {quick ? <PlanCall open={planning} onClose={() => setPlanning(false)} plan={quick} /> : null}
    </div>
  );
}

/**
 * The open conversation. `status` goes under the last message (Sent, Sending, Not sent). `onTop` is called when the
 * feed is scrolled near its top (to load older messages); the reading position is kept when they arrive above.
 * `onPhoto` takes a photo pasted into the composer or dropped on the conversation.
 */
export function ThreadPane({
  name, sub, face, group, msgs, me, status, onSend, plan, closed, onTop, onPhoto, onDraft, draft: startDraft,
}: {
  name: string;
  sub: string;
  face?: string | null;
  group: boolean;
  msgs: Shown[];
  me: string;
  status?: ReactNode;
  onSend: (t: string) => void;
  plan?: Plan;
  closed?: boolean;
  onTop?: () => void;
  onPhoto?: (f: File) => void;
  onDraft?: (t: string) => void;
  /** What the composer starts with (the design's sample message in preview). */
  draft?: string;
}) {
  const [draft, setDraft] = useState(startDraft ?? "");
  const [planning, setPlanning] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const edges = useRef<{ first?: string; last?: string; fromBottom: number }>({ fromBottom: 0 });
  const first = msgs[0]?.id, last = msgs[msgs.length - 1]?.id;
  useLayoutEffect(() => {
    const el = feed.current;
    if (!el) return;
    const was = edges.current;
    // Older messages arrived above (same newest): keep the reader where they were. Otherwise go to the newest.
    if (was.first && first !== was.first && last === was.last) el.scrollTop = el.scrollHeight - was.fromBottom;
    else el.scrollTop = el.scrollHeight;
    edges.current = { first, last, fromBottom: el.scrollHeight - el.scrollTop };
  }, [first, last, msgs.length]);
  const onScroll = () => {
    const el = feed.current;
    if (!el) return;
    edges.current.fromBottom = el.scrollHeight - el.scrollTop;
    if (onTop && el.scrollTop < 80) onTop();
  };
  const send = () => { const t = draft.trim(); if (!t) return; onSend(t); setDraft(""); };
  const pickPhoto = (files: FileList | null | undefined) => {
    const f = files ? Array.from(files).find((x) => x.type.startsWith("image/")) : undefined;
    if (f && onPhoto) { onPhoto(f); return true; }
    return false;
  };
  return (
    <div
      className="ch-msg__main"
      onDragOver={onPhoto && !closed ? (e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); } : undefined}
      onDrop={onPhoto && !closed ? (e) => { if (pickPhoto(e.dataTransfer.files)) e.preventDefault(); } : undefined}
    >
      <Link href="/messages" className="ch-tlink ch-msg__back">Back to Messages</Link>
      <header className="ch-conv__head">
        <div className="ch-conv__who">
          <Face src={face} size={48} />
          <div className="ch-conv__details">
            <h1 className="ch-conv__name">{name}</h1>
            <p className="ch-conv__sub">{sub}</p>
          </div>
        </div>
        {plan && !closed ? <Button variant="secondary" onClick={() => setPlanning(true)}>Arrange a Create Call</Button> : null}
      </header>
      <div className="ch-conv__feed" ref={feed} onScroll={onScroll} role="log" aria-label={`Conversation with ${name}`}>
        {msgs.map((m, i) => (
          <div key={m.id} style={{ display: "contents" }}>
            {i === 0 || day(msgs[i - 1].at) !== day(m.at) ? <p className="ch-date">{day(m.at)}</p> : null}
            <Bubble m={m} me={me} group={group} />
          </div>
        ))}
        {status}
      </div>
      <form className="ch-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          className="ch-composer__field"
          aria-label={`Message ${name}`}
          placeholder={closed ? "This conversation has closed. You can still read it." : "Write a message"}
          value={draft}
          disabled={closed}
          maxLength={2000}
          onChange={(e) => { setDraft(e.target.value); onDraft?.(e.target.value); }}
          onPaste={onPhoto ? (e) => { if (pickPhoto(e.clipboardData?.files)) e.preventDefault(); } : undefined}
        />
        <Button type="submit" iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} disabled={closed || !draft.trim()}>Send</Button>
      </form>
      {plan ? <PlanCall open={planning} onClose={() => setPlanning(false)} plan={plan} /> : null}
    </div>
  );
}
