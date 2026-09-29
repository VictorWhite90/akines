"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { SHARE_PICKER } from "@/lib/data/roomChat";
import { BARS, Ico, Voice, first, mmss } from "./bits";
import type { Chat } from "./useChat";

/**
 * The WhatsApp-style thread shared by Presence Rooms, Circle channels and private rooms:
 * bubbles, quoted replies, photos, voice notes and a composer. Renders as a fragment so the
 * parent's `.rs-main` column lays out the message list and composer.
 */
export default function ChatThread({
  chat,
  hostId,
  placeholder = "Write to the room…",
  draft,
  setDraft,
  inputRef,
  liveJoin,
  onOpenPhoto,
  readOnly,
}: {
  chat: Chat;
  hostId?: PersonId;
  placeholder?: string;
  draft: string;
  setDraft: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  liveJoin?: { live: boolean; joined: boolean; onJoin: () => void };
  onOpenPhoto: (k: PhotoKey) => void;
  /** Shown instead of the composer, e.g. "Join this circle to write". */
  readOnly?: { text: string; cta: string; onCta: () => void };
}) {
  const { msgs, push, typing, simulateReply } = chat;
  const [attach, setAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [rec, setRec] = useState(0);
  const [replyTo, setReplyTo] = useState<(typeof msgs)[number] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const me = ME.id as PersonId;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, typing]);
  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setRec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const sendText = () => {
    const t = draft.trim();
    if (!t) return;
    push({ from: me, kind: "text", text: t, replyTo: replyTo?.id });
    setDraft("");
    setReplyTo(null);
    simulateReply();
  };
  const sendPhoto = (photo: PhotoKey) => {
    push({ from: me, kind: "image", photo, text: draft.trim() || undefined, replyTo: replyTo?.id });
    setDraft("");
    setReplyTo(null);
    setAttach(false);
    simulateReply();
  };
  const sendVoice = () => {
    push({ from: me, kind: "voice", length: mmss(Math.max(rec, 2)) });
    setRecording(false);
    setRec(0);
    simulateReply();
  };

  const byId = (id?: number) => msgs.find((m) => m.id === id);
  const label = (m: { kind: string; text?: string }) => (m.kind === "voice" ? "Voice note" : m.kind === "image" ? "Photo" : m.text);

  return (
    <>
      <div className="rs-msgs" ref={scroller}>
        <div className="day"><span>Today</span></div>
        {msgs.map((m) => {
          if (m.kind === "system") {
            return (
              <div className="sys" key={m.id}>
                <span>
                  {m.live && <Ico n="live" size={14} />} {m.text}
                  {m.live && liveJoin && liveJoin.live && !liveJoin.joined && <button onClick={liveJoin.onJoin}>Join</button>}
                </span>
              </div>
            );
          }
          const mine = m.from === ME.id;
          const q = byId(m.replyTo);
          return (
            <div className={`row${mine ? " mine" : ""}`} key={m.id}>
              {!mine && <Avatar person={PEOPLE[m.from]} size={32} />}
              <div className="bubble">
                {!mine && <b className="name">{PEOPLE[m.from].name}{m.from === hostId && <em>Host</em>}</b>}
                {q && (
                  <div className="quote">
                    <b>{q.from === ME.id ? "You" : first(q.from)}</b>
                    {label(q)}
                  </div>
                )}
                {m.kind === "image" && m.photo && (
                  <button className="img" onClick={() => onOpenPhoto(m.photo!)} aria-label="Open photo">
                    <Pic name={m.photo} sizes="320px" />
                  </button>
                )}
                {m.kind === "voice" && m.length && <Voice length={m.length} mine={mine} />}
                {m.text && <p>{m.text}</p>}
                <span className="meta">{m.at}{mine && <i> ✓✓</i>}</span>
                <button className="reply" onClick={() => { setReplyTo(m); inputRef.current?.focus(); }} aria-label="Reply">↩</button>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="row">
            <Avatar person={PEOPLE[typing]} size={32} />
            <div className="bubble typing"><i /><i /><i /></div>
          </div>
        )}
      </div>

      {readOnly ? (
        <footer className="rs-comp ro">
          <p>{readOnly.text}</p>
          <button onClick={readOnly.onCta}>{readOnly.cta}</button>
        </footer>
      ) : (
      <footer className="rs-comp">
        {replyTo && (
          <div className="replying">
            <div><b>Replying to {replyTo.from === ME.id ? "yourself" : first(replyTo.from)}</b>{label(replyTo)}</div>
            <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button>
          </div>
        )}
        {attach && (
          <div className="attach" role="dialog" aria-label="Share a photo">
            <p><Ico n="image" size={16} /> Share a photo {draft.trim() && <small>· with your message as the caption</small>}</p>
            <div className="grid">
              {SHARE_PICKER.map((k) => (
                <button key={k} onClick={() => sendPhoto(k)} aria-label={PHOTO[k].alt}><Pic name={k} sizes="120px" /></button>
              ))}
            </div>
          </div>
        )}
        {recording ? (
          <div className="recbar">
            <button className="x" onClick={() => { setRecording(false); setRec(0); }} aria-label="Cancel recording"><Ico n="trash" /></button>
            <span className="pulse" />
            <b>{mmss(rec)}</b>
            <div className="wave" aria-hidden>{BARS.map((h, i) => <i key={i} style={{ height: h * 0.5 + 4, animationDelay: `${i * 60}ms` }} />)}</div>
            <button className="send" onClick={sendVoice} aria-label="Send voice note"><Ico n="send" /></button>
          </div>
        ) : (
          <div className="bar">
            <button className="ic" onClick={() => setAttach((v) => !v)} aria-label="Attach a photo" aria-expanded={attach}><Ico n="clip" /></button>
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
            />
            {draft.trim() ? (
              <button className="send" onClick={sendText} aria-label="Send"><Ico n="send" /></button>
            ) : (
              <button className="send" onClick={() => { setRecording(true); setAttach(false); }} aria-label="Record a voice note"><Ico n="mic" /></button>
            )}
          </div>
        )}
      </footer>
      )}
    </>
  );
}
