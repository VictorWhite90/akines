"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Pic from "@/components/home/Pic";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import type { Room } from "@/lib/data/community";
import ChatThread from "@/components/chat/ChatThread";
import { Ico, first, mmss } from "@/components/chat/bits";
import { useChat } from "@/components/chat/useChat";
import { FACE, type PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type Person, type PersonId } from "@/lib/data/people";
import { membersOf, promptsOf, seedMessages } from "@/lib/data/roomChat";

function Tile({ id, speaking, muted, hand, video }: { id: PersonId; speaking: boolean; muted: boolean; hand: boolean; video: boolean }) {
  const p: Person = PEOPLE[id];
  const face = p.face ? FACE[p.face] : null;
  return (
    <div className={`tile${speaking ? " speaking" : ""}${video ? "" : " voiceonly"}`}>
      {video && face ? (
        <Image src={face.src} alt="" fill sizes="240px" style={{ objectFit: "cover", objectPosition: "50% 25%" }} />
      ) : (
        <div className="ini"><Avatar person={p} size={72} /></div>
      )}
      <span className="nm">{id === ME.id ? "You" : first(id)}</span>
      {muted && <span className="mu"><Ico n="mic" size={13} off /></span>}
      {hand && <span className="hand">✋</span>}
      {speaking && <span className="eq" aria-hidden><i /><i /><i /></span>}
    </div>
  );
}

/** A Presence Room as a living space: group chat, voice notes, photos and a live call. */
export default function RoomSpace({ room, demo }: { room: Room; demo?: string }) {
  const host = PEOPLE[room.host];
  const members = useMemo(() => membersOf(room), [room]);
  const prompts = promptsOf(room);
  const chat = useChat(useMemo(() => seedMessages(room), [room]), members);
  const { push } = chat;
  const me = ME.id as PersonId;
  const isPrivate = room.visibility === "private";

  const [draft, setDraft] = useState("");
  const [lightbox, setLightbox] = useState<PhotoKey | null>(null);
  const [info, setInfo] = useState(false);

  // live call
  const startsLive = room.status === "live" || demo === "call";
  const [live, setLive] = useState(startsLive);
  const [joined, setJoined] = useState(demo === "call");
  const [inCall, setInCall] = useState<PersonId[]>(() => (startsLive ? members.filter((m) => m !== me).slice(0, 4) : []));
  const [topic, setTopic] = useState(prompts[0] ?? room.title);
  const [video, setVideo] = useState(true);
  const [clockSecs, setClockSecs] = useState(startsLive ? 724 : 0);
  const [speaker, setSpeaker] = useState<PersonId | null>(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [hand, setHand] = useState(false);
  const [starting, setStarting] = useState(demo === "start");
  const input = useRef<HTMLTextAreaElement>(null);

  // call clock, who is speaking, people drifting in
  useEffect(() => {
    if (!live) return;
    const tick = window.setInterval(() => setClockSecs((s) => s + 1), 1000);
    return () => window.clearInterval(tick);
  }, [live]);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const pool: PersonId[] = [...inCall, ...(joined && mic ? [me] : [])];
      setSpeaker(pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
    }, 2300);
    return () => window.clearInterval(id);
  }, [live, inCall, joined, mic, me]);
  useEffect(() => {
    if (!live || room.mine || inCall.length >= 3) return;
    const id = window.setTimeout(() => {
      const next = members.find((m) => m !== me && !inCall.includes(m));
      if (next) setInCall((c) => [...c, next]);
    }, 3200);
    return () => window.clearTimeout(id);
  }, [live, inCall, members, me, room.mine]);

  const startCall = () => {
    setStarting(false);
    setLive(true);
    setJoined(true);
    setInCall([]);
    setClockSecs(0);
    setMic(true);
    setCam(video);
    push({ from: me, kind: "system", live: true, text: `You started a live session: “${topic}”` });
  };
  const joinCall = () => {
    setJoined(true);
    setMic(true);
    setCam(video);
    push({ from: me, kind: "system", text: "You joined the live session" });
  };
  const leaveCall = () => {
    setJoined(false);
    setHand(false);
    push({ from: me, kind: "system", text: "You left the live session" });
  };

  const seatIds: (PersonId | null)[] = useMemo(() => {
    const ids: PersonId[] = [...inCall, ...(joined ? [me] : [])].slice(0, 6);
    return [...ids, ...Array<null>(6 - ids.length).fill(null)];
  }, [inCall, joined, me]);
  const inCallCount = inCall.length + (joined ? 1 : 0);

  const sharedPhotos = chat.msgs.filter((m) => m.kind === "image" && m.photo);
  const voices = chat.msgs.filter((m) => m.kind === "voice").length;

  return (
    <div className="rs">
      <section className="rs-main">
        {/* header */}
        <header className="rs-head">
          <Link href="/rooms" className="back" aria-label="All rooms">←</Link>
          <div className="thumb"><Pic name={room.photo} sizes="48px" /></div>
          <div className="who">
            <h1>{room.title}</h1>
            <p>
              {chat.typing ? <em>{first(chat.typing)} is typing…</em> : (
                <>
                  {isPrivate && <span className="lockpill"><Ico n="lock" size={11} /> Private</span>}
                  {members.length} in the room · hosted by {room.host === me ? "you" : host.name.split(" ")[0]}
                </>
              )}
            </p>
          </div>
          <div className="acts">
            {!live && <button className="go" onClick={() => setStarting(true)}><Ico n="live" size={17} /> Start live session</button>}
            {live && !joined && <button className="go hide-sm" onClick={joinCall}><span className="dot" /> Join live · {inCallCount}</button>}
            <button className="ic show-sm" onClick={() => setInfo((v) => !v)} aria-label="Room info"><Ico n="info" /></button>
          </div>
        </header>

        {/* live banner (not yet joined) */}
        {live && !joined && (
          <div className="rs-strip">
            <span className="rec"><span className="dot" /> LIVE {mmss(clockSecs)}</span>
            <AvatarStack people={inCall.map((i) => PEOPLE[i])} size={26} max={4} ringClass="ring-[#173c32]" />
            <p><b>{topic}</b><small>{inCallCount} talking · six seats, {6 - inCallCount} open</small></p>
            <button onClick={joinCall}>Join</button>
          </div>
        )}

        {/* live stage */}
        {live && joined && (
          <div className="rs-stage">
            <div className="bar">
              <span className="rec"><span className="dot" /> LIVE {mmss(clockSecs)}</span>
              <p>{topic}</p>
              <span className="cnt">{inCallCount} of 6 seats</span>
            </div>
            <div className="tiles">
              {seatIds.map((id, i) =>
                id ? (
                  <Tile key={id} id={id} speaking={speaker === id && (id !== me || mic)} muted={id === me && !mic} hand={id === me && hand} video={id === me ? cam : video} />
                ) : (
                  <button key={`e${i}`} className="tile empty" onClick={() => setInfo(true)} aria-label="Open seat"><span>＋</span>Open seat</button>
                ),
              )}
            </div>
            <div className="ctl">
              <button className={mic ? "" : "off"} onClick={() => setMic((v) => !v)} aria-label={mic ? "Mute" : "Unmute"}><Ico n="mic" off={!mic} /></button>
              <button className={cam ? "" : "off"} onClick={() => setCam((v) => !v)} aria-label={cam ? "Camera off" : "Camera on"}><Ico n="cam" off={!cam} /></button>
              <button className={hand ? "on" : ""} onClick={() => setHand((v) => !v)} aria-label="Raise hand">✋</button>
              <button className="leave" onClick={leaveCall}><Ico n="leave" /> Leave</button>
            </div>
          </div>
        )}

        <ChatThread chat={chat} hostId={room.host} draft={draft} setDraft={setDraft} inputRef={input} liveJoin={{ live, joined, onJoin: joinCall }} onOpenPhoto={setLightbox} />
      </section>

      {/* info panel */}
      <aside className={`rs-side${info ? " open" : ""}`}>
        <button className="close show-sm" onClick={() => setInfo(false)} aria-label="Close">×</button>
        <div className="about">
          <div className="banner"><Pic name={room.photo} sizes="360px" /><span>{room.tag}</span></div>
          <h2>{room.title}</h2>
          <p className="host"><Avatar person={host} size={28} /> Hosted by <b>{room.host === me ? "you" : host.name}</b></p>
          <p className="blurb">{room.blurb}</p>
          {room.mine && (
            <div className="invite">
              <span><Ico n={isPrivate ? "lock" : "globe"} size={14} /> {isPrivate ? "Invite only" : room.visibility === "circle" ? "Open to the circle" : "Open to all members"}</span>
              <button onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}>Copy invite link</button>
            </div>
          )}
        </div>

        <div className="blk">
          <h3>In this room <small>{members.length}</small></h3>
          <ul className="people">
            {members.map((id) => {
              const p = PEOPLE[id];
              const inThis = inCall.includes(id) || (id === me && joined);
              const away = p.presence === "quiet" || p.presence === "studio";
              return (
                <li key={id}>
                  <Avatar person={p} size={34} />
                  <div><b>{id === me ? `${p.name} (you)` : p.name}</b><small>{p.role} · {p.city}</small></div>
                  {id === room.host && <em className="tag">Host</em>}
                  {inThis ? <span className="st call"><Ico n="mic" size={12} /> In call</span> : <span className={`st ${away ? "away" : "on"}`}>{away ? "Away" : "Online"}</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {prompts.length > 0 && (
          <div className="blk">
            <h3>Ways in <small>tap to use</small></h3>
            <ol className="ways">
              {prompts.map((p, i) => (
                <li key={p}><button onClick={() => { setDraft(p); setInfo(false); input.current?.focus(); }}><span>0{i + 1}</span>{p}</button></li>
              ))}
            </ol>
          </div>
        )}

        <div className="blk">
          <h3>Shared here <small>{sharedPhotos.length} photos · {voices} voice notes</small></h3>
          {sharedPhotos.length === 0 ? (
            <p className="blurb">Photos shared in the chat collect here.</p>
          ) : (
            <div className="shared">
              {sharedPhotos.slice(-6).map((m) => (
                <button key={m.id} onClick={() => setLightbox(m.photo!)} aria-label="Open photo"><Pic name={m.photo!} sizes="110px" /></button>
              ))}
            </div>
          )}
        </div>

        <p className="promise">What's said in this room stays in this room. Be kind, curious and specific.</p>
      </aside>
      {info && <div className="rs-scrim show-sm" onClick={() => setInfo(false)} aria-hidden />}

      {/* start-session dialog */}
      {starting && (
        <div className="rs-modal" onClick={(e) => e.target === e.currentTarget && setStarting(false)} role="dialog" aria-modal="true" aria-label="Start a live session">
          <div className="card">
            <button className="x" onClick={() => setStarting(false)} aria-label="Close">×</button>
            <span className="ac-eyebrow">Live session</span>
            <h2>Talk it through, live.</h2>
            <p>A group call for this room. Six seats, everyone else can keep chatting. It isn&apos;t recorded.</p>
            <label htmlFor="topic">What will you talk about?</label>
            <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <div className="chips">
              {prompts.map((p) => <button key={p} className={topic === p ? "on" : ""} onClick={() => setTopic(p)}>{p}</button>)}
            </div>
            <div className="mode">
              <button className={video ? "on" : ""} onClick={() => setVideo(true)}><Ico n="cam" /> Video call</button>
              <button className={!video ? "on" : ""} onClick={() => setVideo(false)}><Ico n="mic" /> Voice only</button>
            </div>
            <button className="start" disabled={!topic.trim()} onClick={startCall}>Start and notify the room →</button>
          </div>
        </div>
      )}

      {/* photo viewer */}
      {lightbox && (
        <div className="rs-modal dark" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Photo">
          <button className="x" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          <div className="big"><Pic name={lightbox} sizes="900px" /></div>
        </div>
      )}
    </div>
  );
}
