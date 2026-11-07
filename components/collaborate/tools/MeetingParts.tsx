"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/components/kin/Logo";
import { faceSrc } from "@/components/kin/home/parts";
import { useWorkspace } from "@/lib/collab/workspace";
import { useNextSession, callOf, type Seat } from "@/lib/collab/meetings";
import { ME } from "@/lib/collab/me";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { media, useMedia } from "./media";
import "../styles/meeting.css";

/*
 * Shared pieces of the product design's meeting screens (meeting.css, mc-): the round controls and their icons,
 * the video tiles, the top bar, and who is in the meeting, read from our project and lib/collab/meetings.
 */

function Glyph({ size = 24, stroke = 1.5, children }: { size?: number; stroke?: number; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={(stroke * 24) / size} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{children}</svg>;
}
type G = { size?: number };
export const MicIcon = ({ size }: G) => <Glyph size={size}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Glyph>;
export const MicOffIcon = ({ size }: G) => (
  <Glyph size={size}>
    <g transform="scale(1.33333)">
      <path transform="translate(6.75 2.219)" d="M0 4.532V2.282C-0.007 1.796 0.144 1.32 0.43 0.927C0.716 0.534 1.121 0.244 1.586 0.1C2.05 -0.043 2.548 -0.032 3.006 0.131C3.464 0.294 3.857 0.601 4.125 1.007M4.5 4.907V6.032C4.495 6.432 4.384 6.823 4.177 7.166C3.97 7.508 3.676 7.789 3.325 7.98C2.973 8.171 2.577 8.265 2.178 8.252C1.778 8.239 1.389 8.12 1.05 7.907" />
      <path transform="translate(3.75 8.25)" d="M0 0C0.006 0.956 0.273 1.893 0.773 2.709C1.272 3.524 1.985 4.188 2.834 4.628C3.684 5.068 4.637 5.268 5.591 5.206C6.546 5.143 7.465 4.822 8.25 4.275M10.5 0C10.496 0.724 10.343 1.438 10.05 2.1M5.25 5.25V7.5" />
      <path transform="translate(3 3)" d="M0 0L12 12" />
    </g>
  </Glyph>
);
export const CamIcon = ({ size }: G) => <Glyph size={size}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></Glyph>;
export const CamOffIcon = ({ size }: G) => <Glyph size={size}><path d="M10 5h3a2 2 0 0 1 2 2v3l6-3v10l-6-3v2M3 7v10a2 2 0 0 0 2 2h8" /><path d="M3 3l18 18" /></Glyph>;
export const PresentIcon = ({ size }: G) => <Glyph size={size}><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8M12 16v4M12 13V8M12 8l-2.5 2.5M12 8l2.5 2.5" /></Glyph>;
export const LeaveIcon = ({ size }: G) => <Glyph size={size}><path transform="translate(2.5 9.75)" d="M0 3.75C5.5 -1.25 13.5 -1.25 19 3.75L16.8 6.95L13.2 5.55V2.95C10.8 2.05 8.2 2.05 5.8 2.95V5.55L2.2 6.95L0 3.75Z" /></Glyph>;
export const PeopleIcon = ({ size }: G) => <Glyph size={size} stroke={1.25}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.871M16 3.129a4 4 0 0 1 0 7.746" /></Glyph>;
export const ChatIcon = ({ size }: G) => <Glyph size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Glyph>;
export const CloseIcon = ({ size }: G) => <Glyph size={size}><path d="M6 6l12 12M18 6L6 18" /></Glyph>;

/** A round call control. */
export function Round({ label, tone = "default", wide, pressed, onClick, buttonRef, children }: { label: string; tone?: "default" | "alert" | "selected"; wide?: boolean; pressed?: boolean; onClick?: () => void; buttonRef?: React.Ref<HTMLButtonElement>; children: React.ReactNode }) {
  return <button ref={buttonRef} type="button" className={`mc-round mc-round--${tone}${wide ? " mc-round--wide" : ""}`} aria-label={label} aria-pressed={pressed} title={label} onClick={onClick}>{children}</button>;
}

export type CastPerson = { id: PersonId; name: string; photo?: string; role: string };
const strip = (n: string) => n.replace(/\s*\(you\)\s*$/i, "");
const first = (n: string) => strip(n).split(" ")[0]!;

/** Who is in the meeting: you, and the people the call says are here. */
export function useCast(projectId: string) {
  const ws = useWorkspace(projectId);
  const next = useNextSession(projectId);
  const call = callOf(projectId);
  return useMemo(() => {
    const roleOf = (id: PersonId) => ws.project?.members.find((m) => m.id === id)?.role ?? "";
    const personOf = (id: PersonId): CastPerson => ({ id, name: PEOPLE[id]?.name ?? "A member", photo: faceSrc(id, 640), role: roleOf(id) });
    const you = personOf(ME);
    const seats: (Seat & { person: CastPerson })[] = call.here.map((s) => ({ ...s, person: personOf(s.who) }));
    const others = seats.map((s) => s.person);
    const names = others.map((o) => first(o.name));
    const firstNames = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "";
    return { ws, next, project: ws.project, meeting: next.meeting, you, youName: `${strip(you.name)} (You)`, seats, others, firstNames, chat: call.chat };
  }, [ws, next, call]);
}

/** Keep the camera and microphone while a meeting screen is open; stop them shortly after the last one closes. */
export function useMeetingScreen() {
  useEffect(() => { media.screenShown(); return () => media.screenGone(); }, []);
}

/** Your own tile's state: your live camera, or your photo with the microphone state, and a note if a device is blocked. */
export function useSelf() {
  const m = useMedia();
  const view: "live" | "off" = m.hasCam && m.camOn && m.stream ? "live" : "off";
  const micMuted = !m.hasMic || !m.micOn;
  const camMissing = m.camOn && !m.hasCam, micMissing = !m.hasMic;
  let note: string | null = null;
  if (m.phase !== "idle" && m.phase !== "requesting") note = camMissing && micMissing ? "Allow camera and microphone to use them here." : camMissing ? "Allow the camera to use it here." : micMissing ? "Allow the microphone to use it here." : null;
  return { view, stream: m.stream, micMuted, camOff: view === "off", note, toggleMic: media.toggleMic, toggleCam: media.toggleCam };
}
export type Self = ReturnType<typeof useSelf>;

export function Video({ stream, mirror, contain }: { stream: MediaStream | null; mirror?: boolean; contain?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (v.srcObject !== stream) v.srcObject = stream;
    v.play?.().catch(() => {});
    return () => { if (v.srcObject === stream) v.srcObject = null; };
  }, [stream]);
  return <video ref={ref} className={["mc-tile__video", mirror && "mc-tile__video--mirror", contain && "mc-tile__video--contain"].filter(Boolean).join(" ")} autoPlay playsInline muted aria-hidden="true" />;
}

/* eslint-disable @next/next/no-img-element -- the design's tiles are plain images */
const Feed = ({ src, className = "mc-tile__feed" }: { src?: string; className?: string }) => (src ? <img className={className} src={src} alt="" draggable={false} decoding="async" /> : null);

/** Someone with their camera on: their photo stands in for the video. */
export function PersonTile({ person, speaking }: { person: CastPerson; speaking?: boolean }) {
  return (
    <div className={`mc-tile${speaking ? " mc-tile--speaking" : ""}`} data-speaking={speaking ? "true" : undefined}>
      <Feed src={person.photo} />
      <span className="mc-tile__shade" aria-hidden="true" />
      <span className="mc-tile__name">{strip(person.name)}</span>
    </div>
  );
}

/** Someone with their camera off. */
export function AvatarTile({ person, micOff = true }: { person: CastPerson; micOff?: boolean }) {
  return (
    <div className="mc-tile mc-tile--avatar">
      <span className="mc-tile__avatar" aria-hidden="true"><Feed src={person.photo} className="mc-tile__avatar-img" /></span>
      {micOff ? <span className="mc-tile__badge" role="img" aria-label="Microphone off"><MicOffIcon size={16} /></span> : null}
      <span className="mc-tile__name">{strip(person.name)}</span>
    </div>
  );
}

/** Your tile: your camera when it is on, otherwise your photo. */
export function SelfTile({ self, person, name, badge }: { self: Self; person: CastPerson; name: string; badge?: boolean }) {
  return (
    <div className={`mc-tile${self.view === "off" ? " mc-tile--avatar" : ""}`}>
      {self.view === "live" && self.stream ? <Video stream={self.stream} mirror /> : null}
      {self.view === "off" ? <span className="mc-tile__avatar" aria-hidden="true"><Feed src={person.photo} className="mc-tile__avatar-img" /></span> : <span className="mc-tile__shade" aria-hidden="true" />}
      {badge && self.micMuted ? <span className="mc-tile__badge" role="img" aria-label="Your microphone is off"><MicOffIcon size={16} /></span> : null}
      {self.note ? <p className="mc-tile__note" role="status">{self.note}</p> : null}
      <span className="mc-tile__name">{name}</span>
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

export function MeetTop({ project }: { project: string }) {
  return (
    <header className="mc-top">
      <Logo />
      <span className="mc-top__project">{project}</span>
    </header>
  );
}

/** The current time, as the call bar shows it ("4:12 PM"). */
export function useClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 15000); return () => window.clearInterval(t); }, []);
  return now;
}
