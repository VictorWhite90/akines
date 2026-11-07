"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight, MessageSquare } from "lucide-react";
import PlanCall from "@/components/community/PlanCall";
import Button from "@/components/kin/Button";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { CONVOS, KIND_LABEL, type Convo, type KMsg } from "@/lib/data/kinmessage";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

/*
 * Messages, mirrored from the product design (classes in components/kin/community.css): the conversation list
 * beside the open conversation, date groups, bubbles, and a one-line composer. Reads and writes the same
 * conversations and saved messages as before (localStorage km:convos, km:msgs, km:read).
 */

const ME_ID = ME.id as PersonId;
/** Messages carry a time for today, or a day name for earlier: the day is the group heading. */
const day = (at: string) => (/^\d{1,2}:\d{2}/.test(at) ? "Today" : at);
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function sub(c: Convo) {
  if (c.kind === "direct") { const p = PEOPLE[c.members[0]]; return p ? `${p.role} · ${p.city}` : ""; }
  return `${KIND_LABEL[c.kind]} · ${c.members.length + 1} members`;
}

function ConvoFace({ c, size }: { c: Convo; size: number }) {
  const src = c.kind === "direct" ? faceSrc(c.members[0], size * 2) : c.photo ? photoSrc(c.photo, size * 2) : faceSrc(c.members[0], size * 2);
  return (
    <span className="ch-av" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- member or group photo */}
      {src ? <img src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </span>
  );
}

function text(m: KMsg): string {
  switch (m.kind) {
    case "text": return m.text;
    case "voice": return `Voice note · ${m.length}${m.text ? `. ${m.text}` : ""}`;
    case "photo": return m.text ?? "Shared a photo.";
    case "poll": return `${m.question} ${m.options.join(" · ")}`;
    case "invite": return `${m.title}. ${m.detail}`;
    default: return "";
  }
}

function Bubble({ m, group }: { m: KMsg; group: boolean }) {
  if (m.kind === "spark") return null;
  const out = m.from === ME_ID;
  const sender = group && !out ? PEOPLE[m.from as PersonId]?.name.split(" ")[0] : undefined;
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

function Thread({ c, added, onSend }: { c: Convo; added: KMsg[]; onSend: (t: string) => void }) {
  const [draft, setDraft] = useState("");
  const [planning, setPlanning] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const msgs = [...c.msgs, ...added];
  useEffect(() => { const el = feed.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs.length, c.id]);
  const send = () => { const t = draft.trim(); if (!t) return; onSend(t); setDraft(""); };
  const firstMine = c.msgs.length; // messages after the seeded ones are yours, just sent
  return (
    <div className="ch-msg__main">
      <Link href="/messages" className="ch-tlink ch-msg__back">Back to Messages</Link>
      <header className="ch-conv__head">
        <div className="ch-conv__who">
          <ConvoFace c={c} size={48} />
          <div className="ch-conv__details">
            <h1 className="ch-conv__name">{c.name}</h1>
            <p className="ch-conv__sub">{sub(c)}</p>
          </div>
        </div>
        {c.kind === "direct" || c.kind === "project" ? <Button variant="secondary" onClick={() => setPlanning(true)}>Arrange a Create Call</Button> : null}
      </header>
      <div className="ch-conv__feed" ref={feed} role="log" aria-label={`Conversation with ${c.name}`}>
        {msgs.map((m, i) => (
          <div key={m.id} style={{ display: "contents" }}>
            {i === 0 || day(msgs[i - 1].at) !== day(m.at) ? <p className="ch-date">{day(m.at)}</p> : null}
            <Bubble m={m} group={c.kind !== "direct"} />
          </div>
        ))}
        {added.length > 0 && msgs.length > firstMine ? <p className="ch-sent"><Check size={14} strokeWidth={1.5} aria-hidden /><span>Sent</span></p> : null}
      </div>
      <form className="ch-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="ch-composer__field" aria-label={`Message ${c.name}`} placeholder="Write a message" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button type="submit" iconRight={<ArrowRight strokeWidth={1.5} aria-hidden />} disabled={!draft.trim()}>Send</Button>
      </form>
      <PlanCall
        open={planning}
        onClose={() => setPlanning(false)}
        plan={{
          eyebrow: "Create Call",
          title: c.kind === "direct" ? `Arrange a Create Call with ${c.name.split(" ")[0]}` : `Arrange a Create Call for ${c.name}`,
          lead: c.kind === "direct" ? "Make something together, or pick up where you left off." : `Pick a time to work on ${c.name} together.`,
          people: c.members.slice(0, 3),
          convo: c.id,
          note: "Shall we find time to work on this together?",
          placeholder: "Add what you would like to work on (optional)",
        }}
      />
    </div>
  );
}

export default function Messages({ initial }: { initial?: string }) {
  const router = useRouter();
  const [extra, setExtra] = useLocal<Convo[]>("km:convos", []);
  const [added, setAdded] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  const [read, setRead] = useLocal<string[]>("km:read", []);
  const saved = [...extra, ...CONVOS];
  // /messages/<person id> opens your chat with that person, or a fresh one if you have not talked yet.
  const person = initial && initial in PEOPLE && initial !== ME_ID ? (initial as PersonId) : null;
  const existing = initial ? saved.find((x) => x.id === initial) ?? (person ? saved.find((x) => x.kind === "direct" && x.members[0] === person) : undefined) : undefined;
  const fresh: Convo | null = person && !existing ? { id: person, kind: "direct", name: PEOPLE[person].name, members: [person], intent: "checkin", last: "", health: { label: "Growing", value: 10, exchanges: 0, shared: 0, reciprocity: "Just starting", lastMet: "Not yet" }, memories: [], msgs: [] } : null;
  const convos = fresh ? [fresh, ...saved] : saved;
  const open = existing ?? fresh ?? null;

  useEffect(() => {
    if (open && !read.includes(open.id)) setRead([...read, open.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark read when a conversation opens
  }, [open?.id]);

  const send = (c: Convo, t: string) => {
    if (fresh && c.id === fresh.id && !(added[c.id]?.length)) setExtra([fresh, ...extra]);
    setAdded((cur) => ({ ...cur, [c.id]: [...(cur[c.id] ?? []), { id: newId("m"), from: ME_ID, at: now(), kind: "text", text: t }] }));
  };
  const last = (c: Convo) => { const all = [...c.msgs, ...(added[c.id] ?? [])]; const m = all[all.length - 1]; return m ? text(m) : c.last; };
  const meta = (c: Convo) => { const all = [...c.msgs, ...(added[c.id] ?? [])]; return all[all.length - 1]?.at.split(" · ")[0] ?? ""; };
  const someone = allPeople.find((p) => p.id !== ME_ID && !saved.some((c) => c.kind === "direct" && c.members[0] === p.id));

  return (
    <div className="ch-msg" data-view={open ? "thread" : "list"}>
      <nav className="ch-msg__side" aria-label="Conversations">
        <h2 className="ch-msg__title">Messages</h2>
        <div className="ch-msg__list">
          {convos.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className={open?.id === c.id ? "ch-row ch-row--on" : "ch-row"}>
              <ConvoFace c={c} size={44} />
              <span className="ch-row__text"><span className="ch-row__title">{c.name}</span><span className="ch-row__desc">{last(c)}</span></span>
              <span className="ch-row__meta">{meta(c)}</span>
              <span className="ch-row__chev"><ChevronRight size={16} strokeWidth={1.5} aria-hidden /></span>
            </Link>
          ))}
        </div>
      </nav>
      {open ? (
        <Thread key={open.id} c={open} added={added[open.id] ?? []} onSend={(t) => send(open, t)} />
      ) : (
        <div className="ch-msg__main">
          <div className="ch-msg__empty">
            <MessageSquare size={40} strokeWidth={1.25} aria-hidden />
            <h1 className="ch-msg__empty-title">Choose a conversation</h1>
            <p className="ch-msg__empty-text">Pick someone from the list to continue, or start something new.</p>
            {someone ? <Button variant="secondary" onClick={() => router.push(`/messages/${someone.id}`)}>Start a new conversation</Button> : null}
          </div>
        </div>
      )}
    </div>
  );
}
