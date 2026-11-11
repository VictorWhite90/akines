"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button, { IconButton } from "@/components/kin/Button";
import { meetingClock } from "@/lib/collab/meetings";
import { media, useMedia } from "./media";
import { AvatarTile, CamIcon, CamOffIcon, ChatIcon, CloseIcon, LeaveIcon, MicIcon, MicOffIcon, PeopleIcon, PersonTile, PresentIcon, Round, SelfTile, Video, useCast, useClock, useMeetingScreen, useSelf, type CastPerson, type Self } from "./MeetingParts";
import { MeetingMissing } from "./MeetingEnded";

/*
 * The meeting call, mirrored from the product design (meeting.css, mc-call): the team's tiles with the speaker
 * outlined, your own tile, the call bar (time and name; microphone, camera, present, leave; people and chat),
 * the people and chat panels, and presenting your screen. Chat messages live only for the call.
 */

const SPEAKER_EVERY = 4500;

const Panel = forwardRef<HTMLElement, { title: string; subtitle: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }>(function Panel({ title, subtitle, onClose, children, footer }, ref) {
  return (
    <aside ref={ref} className="mc-panel" aria-label={title} tabIndex={-1}>
      <div className="mc-panel__head">
        <div className="mc-panel__heading">
          <h2 className="mc-panel__title">{title}</h2>
          <p className="mc-panel__sub">{subtitle}</p>
        </div>
        <IconButton variant="ghost" size="sm" tooltip={false} label={`Close ${title.toLowerCase()}`} onClick={onClose}><CloseIcon size={16} /></IconButton>
      </div>
      {children}
      {footer}
    </aside>
  );
});

type ChatMsg = { id: string; name: string; time: string; text: string };

const ChatPanel = forwardRef<HTMLElement, { messages: ChatMsg[]; onSend: (t: string) => void; onClose: () => void }>(function ChatPanel({ messages, onSend, onClose }, ref) {
  const [draft, setDraft] = useState("");
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { const l = list.current; if (l) l.scrollTop = l.scrollHeight; }, [messages.length]);
  return (
    <Panel ref={ref} title="Chat" subtitle="Messages are only visible during the call" onClose={onClose}
      footer={
        <form className="mc-chat__footer" onSubmit={(e) => { e.preventDefault(); const t = draft.trim(); if (t) { onSend(t); setDraft(""); } }}>
          <input className="mc-chat__field" type="text" name="message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Send a message" aria-label="Send a message" autoComplete="off" enterKeyHint="send" />
        </form>
      }>
      <div ref={list} className="mc-chat__list" role="log" aria-live="polite" aria-label="Messages">
        {messages.map((m) => (
          <div key={m.id} className="mc-msg">
            <div className="mc-msg__meta"><span className="mc-msg__name">{m.name}</span><span className="mc-msg__time">{m.time}</span></div>
            <p className="mc-msg__text">{m.text}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
});

const PeoplePanel = forwardRef<HTMLElement, { roster: { person: CastPerson; name: string; micOff: boolean }[]; onClose: () => void }>(function PeoplePanel({ roster, onClose }, ref) {
  return (
    <Panel ref={ref} title="People" subtitle={`${roster.length} in this meeting`} onClose={onClose}>
      <ul className="mc-people">
        {roster.map(({ person, name, micOff }) => (
          <li key={person.id} className="mc-person">
            {/* eslint-disable-next-line @next/next/no-img-element -- member face */}
            {person.photo ? <img className="mc-person__img" src={person.photo} alt="" width={40} height={40} draggable={false} /> : <span className="mc-person__img" aria-hidden="true" />}
            <span className="mc-person__text"><span className="mc-person__name">{name}</span><span className="mc-person__role">{person.role}</span></span>
            <span className={`mc-person__mic${micOff ? " mc-person__mic--off" : ""}`} role="img" aria-label={micOff ? "Microphone off" : "Microphone on"}>{micOff ? <MicOffIcon size={18} /> : <MicIcon size={18} />}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
});

export default function MeetingCall({ projectId }: { projectId: string }) {
  const cast = useCast(projectId);
  const router = useRouter();
  const m = useMedia();
  const self: Self = useSelf();
  useMeetingScreen();
  const [panel, setPanel] = useState<"people" | "chat" | null>(null);
  const presenting = !!m.screen;
  const [speaker, setSpeaker] = useState(0);
  const now = useClock();
  const [chat, setChat] = useState<ChatMsg[] | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const peopleBtn = useRef<HTMLButtonElement>(null);
  const chatBtn = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  const { session, startNow, join } = cast.next;
  const ready = !!cast.project;
  // Joining the call starts the session if it was only planned, or records you as in it if it's already on.
  useEffect(() => { if (!ready) return; if (session.status === "ongoing") join(); else startNow(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { media.markJoined(); media.clearScreenNote(); void media.request(); }, []);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setSpeaker((s) => (s + 1) % 2), SPEAKER_EVERY);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (!m.screenNote) return;
    const t = window.setTimeout(() => media.clearScreenNote(), 6000);
    return () => window.clearTimeout(t);
  }, [m.screenNote]);
  const close = useCallback(() => { (panel === "chat" ? chatBtn : peopleBtn).current?.focus(); setPanel(null); }, [panel]);
  useEffect(() => {
    if (!panel) return;
    if (opened.current) panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, close]);

  if (!cast.project) return <MeetingMissing ready={cast.ws.ready} />;

  const joinedAt = m.joinedAt ?? now;
  const messages: ChatMsg[] = chat ?? cast.chat.map((c, i) => ({ id: `seed-${i}`, name: cast.others.find((o) => o.id === c.who)?.name ?? "", time: meetingClock(new Date(joinedAt - (cast.chat.length - 1 - i) * 2 * 60000)), text: c.text })).filter((c) => c.name);
  const toggle = (p: "people" | "chat") => { opened.current = true; setPanel((cur) => (cur === p ? null : p)); };
  const present = async () => { if (presenting) { media.stopPresenting(); return; } await media.present(); };
  const leave = () => { cast.next.end(); media.leave(projectId); router.push(`/collaborate/my-projects/${projectId}/meet/ended`); };
  const send = (text: string) => setChat([...messages, { id: `m${messages.length + 1}-${Date.now()}`, name: cast.youName, time: meetingClock(), text }]);

  const live = cast.seats.filter((s) => s.camera);
  const speaking = live.filter((s) => s.mic);
  const speakerId = speaking.length ? speaking[speaker % speaking.length]!.who : undefined;
  const tiles = cast.seats.map((s) => (s.camera ? <PersonTile key={s.who} person={s.person} speaking={s.who === speakerId} /> : <AvatarTile key={s.who} person={s.person} micOff={!s.mic} />));
  const roster = [{ person: cast.you, name: cast.youName, micOff: self.micMuted }, ...cast.seats.map((s) => ({ person: s.person, name: s.person.name, micOff: !s.mic }))];

  return (
    <div className="mc-call">
      <h1 className="mc-sr">{cast.meeting.name}</h1>
      <div className={`mc-stage${panel ? " mc-stage--panel" : ""}${presenting ? " mc-stage--share" : ""}`}>
        <div className="mc-main">
          {presenting ? (
            <>
              <div className="mc-share">
                <Video stream={m.screen} contain />
                <div className="mc-pill" role="status">
                  <span className="mc-pill__dot" aria-hidden="true" />
                  <span className="mc-pill__text">You are presenting to everyone</span>
                  <Button variant="danger" size="sm" onClick={() => media.stopPresenting()}>Stop presenting</Button>
                </div>
              </div>
              <div className="mc-side">{tiles}</div>
            </>
          ) : (
            <div className="mc-grid">
              {tiles}
              <SelfTile self={self} person={cast.you} name={cast.youName} badge />
            </div>
          )}
        </div>
        {panel === "people" ? <PeoplePanel ref={panelRef} roster={roster} onClose={close} /> : null}
        {panel === "chat" ? <ChatPanel ref={panelRef} messages={messages} onSend={send} onClose={close} /> : null}
        {m.screenNote ? <p className="mc-callnote" role="status">{m.screenNote}</p> : null}
      </div>
      <div className="mc-bar" role="group" aria-label="Call controls">
        <div className="mc-info">
          <span className="mc-info__time">{meetingClock(new Date(now))}</span>
          <span className="mc-info__sep" aria-hidden="true" />
          <span className="mc-info__name">{cast.meeting.name}</span>
        </div>
        <div className="mc-bar__center">
          <Round label={self.micMuted ? "Turn on microphone" : "Turn off microphone"} tone={self.micMuted ? "alert" : "default"} onClick={self.toggleMic}>{self.micMuted ? <MicOffIcon /> : <MicIcon />}</Round>
          <Round label={self.camOff ? "Turn on camera" : "Turn off camera"} tone={self.camOff ? "alert" : "default"} onClick={self.toggleCam}>{self.camOff ? <CamOffIcon /> : <CamIcon />}</Round>
          <Round label="Present" tone={presenting ? "selected" : "default"} pressed={presenting} onClick={present}><PresentIcon /></Round>
          <Round label="Leave meeting" tone="alert" wide onClick={leave}><LeaveIcon /></Round>
        </div>
        <div className="mc-bar__right">
          <Round buttonRef={peopleBtn} label="People" tone={panel === "people" ? "selected" : "default"} pressed={panel === "people"} onClick={() => toggle("people")}><PeopleIcon /></Round>
          <Round buttonRef={chatBtn} label="Chat" tone={panel === "chat" ? "selected" : "default"} pressed={panel === "chat"} onClick={() => toggle("chat")}><ChatIcon /></Round>
        </div>
      </div>
    </div>
  );
}
