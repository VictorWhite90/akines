"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown2, ArrowLeft2, ArrowRight2, EmojiHappy, Message, Microphone2, MicrophoneSlash1, More, People, Send2, Share } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { canGoBack } from "@/lib/navHistory";
import type { BanterNow } from "@/lib/data/banter";
import { ME, PEOPLE, allPeople, type PersonId } from "@/lib/data/people";

type Role = "Host" | "Co-host" | "Speaker" | "Listener";
type Seat = { id: PersonId; role: Role };
const REACTIONS = ["😂", "🔥", "👏", "❤️", "💯", "🤔"];

/** Live Banter, laid out like a Space: title, pinned cards, a grid of faces with roles, one action bar. */
export default function LiveStage({ session, mm, ss, onEnd }: { session: BanterNow; mm: number; ss: number; onEnd: () => void }) {
  const router = useRouter();
  const me = ME.id as PersonId;

  const seats: Seat[] = useMemo(() => {
    const speakers = session.people.filter((p) => p !== me);
    const listeners = allPeople.map((p) => p.id as PersonId).filter((p) => p !== me && !speakers.includes(p)).slice(0, 7);
    return [
      ...speakers.map((id, i) => ({ id, role: (id === session.host ? "Host" : i === 1 ? "Co-host" : "Speaker") as Role })),
      { id: me, role: "Listener" as Role },
      ...listeners.map((id) => ({ id, role: "Listener" as Role })),
    ];
  }, [session, me]);

  const [myRole, setMyRole] = useState<Role>("Listener");
  const [muted, setMuted] = useState(true);
  const [hand, setHand] = useState(false);
  const [speaking, setSpeaking] = useState(0);
  const [reacts, setReacts] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState(false);
  const [panel, setPanel] = useState<null | "people" | "chat">(null);
  const [pin, setPin] = useState(0);
  const [chat, setChat] = useState<{ by: PersonId; text: string }[]>([
    { by: seats[1]?.id ?? me, text: "Welcome everyone! Keep it kind, keep it honest." },
    { by: seats[4]?.id ?? me, text: "Joining from Garki 👋" },
  ]);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const speakers = seats.filter((s) => s.role !== "Listener" || (s.id === me && myRole !== "Listener"));
  const live = speakers.filter((s) => s.id !== me);

  // The room feels alive: someone different speaks every few seconds; a friend reacts now and then.
  useEffect(() => {
    const t = setInterval(() => setSpeaking((x) => (x + 1) % Math.max(live.length, 1)), 3200);
    return () => clearInterval(t);
  }, [live.length]);
  useEffect(() => {
    const t = setInterval(() => {
      const s = seats[Math.floor(Math.random() * seats.length)];
      if (s.id === me) return;
      setReacts((r) => ({ ...r, [s.id]: REACTIONS[Math.floor(Math.random() * REACTIONS.length)] }));
      setTimeout(() => setReacts((r) => { const n = { ...r }; delete n[s.id]; return n; }), 2200);
    }, 4000);
    return () => clearInterval(t);
  }, [seats, me]);
  // A raised hand is accepted by the host after a moment.
  useEffect(() => {
    if (!hand) return;
    const t = setTimeout(() => { setHand(false); setMyRole("Speaker"); }, 2500);
    return () => clearTimeout(t);
  }, [hand]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "end" });
  }, [chat, panel]);

  const react = (e: string) => {
    setPicker(false);
    setReacts((r) => ({ ...r, [me]: e }));
    setTimeout(() => setReacts((r) => { const n = { ...r }; delete n[me]; return n; }), 2200);
  };
  const share = async () => {
    try { await navigator.clipboard.writeText(`Join "${session.topic}" live on Akines: ${window.location.href}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const leave = () => (canGoBack() ? router.back() : router.push("/banter"));
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setChat((c) => [...c, { by: me, text: draft.trim() }]);
    setDraft("");
  };

  const pins = [
    { kicker: "The question", body: session.topic, by: PEOPLE[session.host].name },
    { kicker: "House rules", body: "Everyone gets a turn. Disagree warmly. Nothing is recorded.", by: "Akines" },
    { kicker: "Where this is from", body: `Started in ${session.context}. ${session.minutes} minutes, up to 8 voices.`, by: PEOPLE[session.host].name },
  ];
  const roleOf = (s: Seat) => (s.id === me ? myRole : s.role);
  const ordered = [...speakers.filter((s) => s.id !== me || myRole !== "Listener"), ...seats.filter((s) => roleOf(s) === "Listener")];

  return (
    <div className="lv kh">
      <header className="lv-top">
        <button className="lv-ic" onClick={leave} aria-label="Minimise"><ArrowDown2 size={20} color="currentColor" /></button>
        <span className="lv-top-r">
          <button className="lv-ic" onClick={share} aria-label="Share this Banter"><Share size={19} color="currentColor" /></button>
          <button className="lv-ic" aria-label="More options"><More size={19} color="currentColor" /></button>
          <button className="lv-leave" onClick={leave}>Leave</button>
        </span>
      </header>
      {copied && <p className="lv-toast" role="status">Link copied</p>}

      <div className="lv-meta">
        <span className="lv-live"><i />LIVE</span>
        <span className="lv-time">{mm}:{String(ss).padStart(2, "0")} left</span>
        <span className="lv-norec">Not recorded</span>
      </div>
      <h1 className="lv-title">{session.topic}</h1>

      <div className="lv-pins">
        <button className="lv-pin-nav" onClick={() => setPin((p) => (p + pins.length - 1) % pins.length)} aria-label="Previous pinned"><ArrowLeft2 size={16} color="currentColor" /></button>
        <article className="lv-pin" key={pin}>
          <small>{pins[pin].kicker}</small>
          <p>{pins[pin].body}</p>
          <span>Pinned by {pins[pin].by}</span>
        </article>
        <button className="lv-pin-nav" onClick={() => setPin((p) => (p + 1) % pins.length)} aria-label="Next pinned"><ArrowRight2 size={16} color="currentColor" /></button>
      </div>
      <div className="lv-dots" aria-hidden>{pins.map((_, i) => <i key={i} className={i === pin ? "on" : undefined} />)}</div>

      <ul className="lv-grid">
        {ordered.map((s) => {
          const p = PEOPLE[s.id];
          const role = roleOf(s);
          const isMe = s.id === me;
          const talking = isMe ? role !== "Listener" && !muted : live[speaking]?.id === s.id;
          return (
            <li key={s.id} className={talking ? "talk" : undefined}>
              <span className="lv-face">
                <Avatar person={p} size={56} />
                {reacts[s.id] && <span className="lv-react" aria-hidden>{reacts[s.id]}</span>}
                {isMe && hand && <span className="lv-hand" aria-label="Hand raised">✋</span>}
              </span>
              <b>{isMe ? "You" : p.name.split(" ")[0]}</b>
              <small className={role !== "Listener" ? "spk" : undefined}>
                {role !== "Listener" && (talking ? <span className="lv-bars" aria-hidden><i /><i /><i /></span> : <MicrophoneSlash1 size={12} color="currentColor" />)}
                {role}
              </small>
            </li>
          );
        })}
      </ul>

      <footer className="lv-bar">
        {myRole === "Listener" ? (
          <button className={`lv-mic${hand ? " on" : ""}`} onClick={() => setHand((h) => !h)} aria-pressed={hand} aria-label={hand ? "Lower hand" : "Ask to speak"}>
            {hand ? <span aria-hidden>✋</span> : <Microphone2 size={24} color="currentColor" />}
            <em>{hand ? "Hand raised" : "Ask to speak"}</em>
          </button>
        ) : (
          <button className={`lv-mic${muted ? "" : " live"}`} onClick={() => setMuted((m) => !m)} aria-pressed={!muted} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <MicrophoneSlash1 size={24} color="currentColor" /> : <Microphone2 size={24} color="currentColor" />}
            <em>{muted ? "Mic off" : "Mic on"}</em>
          </button>
        )}
        <span className="lv-acts">
          <button className="lv-ic b" onClick={() => setPanel(panel === "people" ? null : "people")} aria-label="People"><People size={20} color="currentColor" /></button>
          <span className="lv-pick-wrap">
            <button className="lv-ic b" onClick={() => setPicker((v) => !v)} aria-label="React"><EmojiHappy size={20} color="currentColor" /></button>
            {picker && <span className="lv-picker">{REACTIONS.map((r) => <button key={r} onClick={() => react(r)} aria-label={`React ${r}`}>{r}</button>)}</span>}
          </span>
          <button className="lv-ic b lv-chat" onClick={() => setPanel(panel === "chat" ? null : "chat")} aria-label="Chat"><Message size={20} color="currentColor" /><span>{chat.length}</span></button>
        </span>
      </footer>

      {myRole !== "Listener" && <button className="lv-end" onClick={onEnd}>End and reflect</button>}

      {panel && (
        <div className="lv-panel" role="dialog" aria-label={panel === "chat" ? "Chat" : "People"}>
          <header><b>{panel === "chat" ? "Chat" : `${seats.length} people here`}</b><button className="lv-ic" onClick={() => setPanel(null)} aria-label="Close">×</button></header>
          {panel === "people" ? (
            <ul className="lv-people">
              {ordered.map((s) => <li key={s.id}><Avatar person={PEOPLE[s.id]} size={36} /><span><b>{s.id === me ? "You" : PEOPLE[s.id].name}</b><small>{roleOf(s)}</small></span>{s.id !== me && <Link href={`/profile/${s.id}`} className="kh-btn outline sm">View</Link>}</li>)}
            </ul>
          ) : (
            <>
              <div className="lv-msgs">
                {chat.map((m, i) => <p key={i}><Avatar person={PEOPLE[m.by]} size={24} /><span><b>{m.by === me ? "You" : PEOPLE[m.by].name.split(" ")[0]}</b> {m.text}</span></p>)}
                <div ref={chatEnd} />
              </div>
              <form className="lv-send" onSubmit={send}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Say something to the room…" aria-label="Message" />
                <button type="submit" aria-label="Send" disabled={!draft.trim()}><Send2 size={18} color="currentColor" /></button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
