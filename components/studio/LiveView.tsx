"use client";

import { useEffect, useRef, useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { Ico } from "./parts";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import type { Studio } from "@/lib/data/studio";

type Msg = { id: number; who: PersonId; text: string; at: string };
const SEED: Msg[] = [
  { id: 1, who: "leila", text: "Hello! Is that the blue door in the corner?", at: "17:02" },
  { id: 2, who: "zuri", text: "The light in here is lovely. Is it always this warm?", at: "17:03" },
  { id: 3, who: "chidi", text: "Could you show the brushes you use for the edges?", at: "17:05" },
];
const GUESTS: PersonId[] = ["leila", "zuri", "chidi", "efua"];
const REPLIES = ["Thank you, that helps.", "I love that you show the unfinished parts.", "Could you hold it up to the window?"];
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** A mock live visit: the member's tile on a big stage, visitors beside it, and a chat rail. */
export default function LiveView({ studio, onEnd }: { studio: Studio; onEnd: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    const pending = timers.current;
    return () => {
      window.clearInterval(id);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: Date.now(), who: "amara", text: t, at: clock() }]);
    setText("");
    const reply = window.setTimeout(() => setMsgs((m) => [...m, { id: Date.now() + 1, who: GUESTS[m.length % GUESTS.length], text: REPLIES[m.length % REPLIES.length], at: clock() }]), 1600);
    timers.current.push(reply);
  };

  return (
    <div className="sd-live" role="dialog" aria-modal="true" aria-label="Live from my space">
      <div className="stage">
        <div className="bar">
          <span className="rec"><i />LIVE</span>
          <p>{studio.name}: an open hour</p>
          <span className="cnt">{mmss(secs)} · {GUESTS.length} visiting</span>
        </div>
        <div className="big">
          <Pic name={studio.cover} sizes="(max-width: 760px) 100vw, 800px" />
          <div className="shade" />
          <span className="nm"><Avatar person={ME} size={22} /> {ME.name} · the studio</span>
          {!cam && <div className="camoff"><Avatar person={ME} size={72} /><span>Camera off</span></div>}
          {studio.works[0] && <span className="now">Now showing: {studio.works[0].title}</span>}
        </div>
        <div className="guests">
          {GUESTS.map((g, i) => (
            <div className={`g${i === 0 ? " speaking" : ""}`} key={g}>
              <Avatar person={PEOPLE[g]} size={38} />
              <span>{PEOPLE[g].name.split(" ")[0]}</span>
            </div>
          ))}
          <div className="g empty"><span>+</span>2 seats free</div>
        </div>
        <div className="ctl">
          <button className={mic ? "" : "off"} onClick={() => setMic((v) => !v)} aria-pressed={!mic} aria-label={mic ? "Mute microphone" : "Unmute microphone"}><Ico n="mic" /> {mic ? "Mic on" : "Muted"}</button>
          <button className={cam ? "" : "off"} onClick={() => setCam((v) => !v)} aria-pressed={!cam} aria-label={cam ? "Turn camera off" : "Turn camera on"}><Ico n="cam" /> {cam ? "Camera on" : "Camera off"}</button>
          {confirm ? (
            <>
              <button className="leave" onClick={onEnd}>End for everyone</button>
              <button onClick={() => setConfirm(false)}>Stay live</button>
            </>
          ) : (
            <button className="leave" onClick={() => setConfirm(true)}>End</button>
          )}
        </div>
      </div>

      <aside className="chat" aria-label="Visitor chat">
        <h3>Chat from the door</h3>
        <div className="msgs" ref={list}>
          {msgs.map((m) => (
            <div key={m.id} className={`row${m.who === "amara" ? " mine" : ""}`}>
              <Avatar person={PEOPLE[m.who]} size={26} />
              <div className="bub"><b>{m.who === "amara" ? "You" : PEOPLE[m.who].name.split(" ")[0]}</b><p>{m.text}</p><span>{m.at}</span></div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something to your visitors" aria-label="Message" />
          <button type="submit" aria-label="Send" disabled={!text.trim()}><Ico n="send" size={16} /></button>
        </form>
      </aside>
    </div>
  );
}
