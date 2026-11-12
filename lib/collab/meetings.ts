"use client";

import { useCallback, useMemo } from "react";
import { mutate, peek, teamwork, useResource, type ApiMeeting } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { PersonId } from "@/lib/data/people";

/*
 * A project's team meetings, as the product design shows them: the next session on the workspace rail
 * (meeting-card.css, mt-), and the meeting itself (meeting.css, mc-): the lobby, the call and the end.
 * The backend keeps the meeting's record (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET    meetings/next              → the meeting happening now, or the next planned one (with who's in)
 *   POST   meetings                   ← { name, minutes, starts_at }  (plan; planning again moves it)
 *   POST   meetings/start             ← { name?, minutes? }  (start now; joins it if one is already happening)
 *   POST   meetings/:id/join          ← { camera, mic }      POST meetings/:id/leave (the last one out ends it)
 *   POST   meetings/:id/end           (the host or whoever started it)   DELETE meetings/:id (cancel a planned one)
 * Nothing is recorded or sent: the camera and microphone only show your own preview (components/collaborate/tools/media.ts).
 * In the demo it shares its store with lib/collab/session.ts (same key and shape), so the rail and the meeting agree.
 */

export type Session = {
  status: "upcoming" | "ongoing" | "none";
  name: string;
  /** "THU" and "4 PM", for the date tile. */
  day: string;
  time: string;
  /** "Thursday, 4:00 PM" */
  when: string;
  minutes: number;
  startedAt?: string;
};

/** Someone in the call, other than you. */
export type Seat = { who: PersonId; camera: boolean; mic: boolean };
export type Call = { here: Seat[]; chat: { who: PersonId; text: string }[] };

export const SESSION_TIMES = ["Thursday, 4:00 PM", "Friday, 10:00 AM", "Monday, 2:00 PM", "Tuesday, 11:00 AM"];
export const SESSION_LENGTHS = [15, 30, 45, 60];

/** The design's meetings: Prototype review (Career Guidance for Everyone) and Colour review (Adire Stories). */
const SEED: Record<string, Session> = {
  "career-guidance-for-everyone": { status: "upcoming", name: "Prototype review", day: "THU", time: "4 PM", when: "Thursday, 4:00 PM", minutes: 45 },
  "adire-stories": { status: "upcoming", name: "Colour review", day: "THU", time: "4 PM", when: "Thursday, 4:00 PM", minutes: 45 },
};
const NONE: Session = { status: "none", name: "Team meeting", day: "", time: "", when: "", minutes: 45 };

/** Who is in the call (the two who can speak, then the one who is muted with the camera off) and the chat, as the design's call shows them. */
const CALLS: Record<string, Call> = {
  "career-guidance-for-everyone": {
    here: [{ who: "adaeze", camera: true, mic: true }, { who: "tobi", camera: true, mic: true }, { who: "ngozi", camera: false, mic: false }],
    chat: [{ who: "adaeze", text: "I can see the second screen now." }, { who: "ngozi", text: "Could we look at the last question again?" }],
  },
  "adire-stories": {
    here: [{ who: "amara-obi", camera: true, mic: true }, { who: "ayo-bello", camera: true, mic: true }, { who: "yusuf-danjuma", camera: false, mic: false }],
    chat: [{ who: "amara-obi", text: "I can see the second screen now." }, { who: "yusuf-danjuma", text: "Could we look at the last question again?" }],
  },
};
const EMPTY: Call = { here: [], chat: [] };

const clock = (d = new Date()) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?([ap])m/i, (_, a: string) => ` ${a.toUpperCase()}M`);
export { clock as meetingClock };

/** A project's next session as seeded, for places that only need to read it once. Use `useNextSession` to follow changes. */
export const nextSession = (projectId: string): Session => (DEMO ? SEED[projectId] ?? NONE : sessionFromApi(peek<ApiMeeting | null>(meetingKey(projectId))));
/** Who is in a project's call right now, apart from you. On the backend: who has joined the meeting happening now. */
export const callOf = (projectId: string): Call => {
  if (!DEMO) {
    const m = peek<ApiMeeting | null>(meetingKey(projectId));
    if (!m || m.status !== "ongoing") return EMPTY;
    return { here: m.here.filter((s) => s.by && s.by !== ME).map((s) => ({ who: s.by as PersonId, camera: s.camera, mic: s.mic })), chat: [] };
  }
  const c = CALLS[projectId] ?? EMPTY;
  return { ...c, here: c.here.filter((s) => s.who !== ME) };
};

function useLocalNextSession(projectId: string) {
  const [all, setAll] = useLocal<Record<string, Session>>("ak:collab-sessions:v2", SEED);
  const session = all[projectId] ?? NONE;
  const put = useCallback((s: Session) => setAll((cur) => ({ ...cur, [projectId]: s })), [projectId, setAll]);
  return {
    session,
    /** The meeting as the lobby and call name it: once a session has ended, the one that was planned. */
    meeting: session.status === "none" ? { ...(SEED[projectId] ?? NONE), status: "none" as const } : session,
    startNow: () => put({ ...session, name: session.status === "none" ? "Team meeting" : session.name, status: "ongoing", minutes: session.minutes || 45, startedAt: clock() }),
    schedule: (s: { name: string; minutes: number; when: string }) => {
      const [d, t] = s.when.split(", ");
      put({ status: "upcoming", name: s.name.trim() || "Team meeting", day: (d ?? "Thursday").slice(0, 3).toUpperCase(), time: (t ?? "4:00 PM").replace(":00", ""), when: s.when, minutes: s.minutes });
    },
    end: () => put({ ...session, status: "none" }),
    restore: put,
    /** Joining a meeting that's already happening (the demo has nothing to record). */
    join: () => {},
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

const meetingKey = (projectId: string) => `tw:meeting:${projectId}`;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Thursday, 4:00 PM" → the next such moment from now (next week if it has passed today). */
export function nextOccurrence(when: string, now = new Date()): Date {
  const [dayName = "", t = ""] = when.split(", ");
  const day = WEEKDAYS.findIndex((d) => d.toLowerCase() === dayName.trim().toLowerCase());
  const m = /^(\d{1,2})(?::(\d{2}))?\s*([AP]M)?$/i.exec(t.trim());
  let hour = m ? Number(m[1]) % 12 : 16;
  if (m?.[3]?.toUpperCase() === "PM") hour += 12;
  const at = new Date(now);
  at.setHours(hour, m?.[2] ? Number(m[2]) : 0, 0, 0);
  const ahead = day < 0 ? 0 : (day - now.getDay() + 7) % 7;
  at.setDate(at.getDate() + ahead);
  if (at <= now) at.setDate(at.getDate() + (day < 0 ? 1 : 7));
  return at;
}

function sessionFromApi(m: ApiMeeting | null | undefined): Session {
  if (!m || (m.status !== "ongoing" && m.status !== "scheduled")) return NONE;
  const at = m.starts_at ? new Date(m.starts_at) : null;
  const time = at ? clock(at).replace(":00", "") : "";
  return {
    status: m.status === "ongoing" ? "ongoing" : "upcoming", name: m.name, minutes: m.minutes,
    day: at ? WEEKDAYS[at.getDay()]!.slice(0, 3).toUpperCase() : "", time,
    when: at ? `${WEEKDAYS[at.getDay()]}, ${clock(at)}` : "",
    startedAt: m.started_at ? clock(new Date(m.started_at)) : undefined,
  };
}

function useRemoteNextSession(projectId: string) {
  const key = projectId ? meetingKey(projectId) : null;
  const meeting = useResource<ApiMeeting | null>(key, () => teamwork.nextMeeting(projectId), 15_000);
  const session = useMemo(() => sessionFromApi(meeting), [meeting]);
  const set = (m: ApiMeeting | undefined) => { if (m !== undefined && key) mutate<ApiMeeting | null>(key, () => (m.status === "ongoing" || m.status === "scheduled" ? m : null)); };
  const schedule = (s: { name: string; minutes: number; when: string }) => {
    void teamwork.schedule(projectId, { name: s.name.trim(), minutes: s.minutes, starts_at: nextOccurrence(s.when).toISOString() }).then(set);
  };
  return {
    session,
    meeting: session.status === "none" ? { ...NONE, status: "none" as const } : session,
    startNow: () => {
      if (key) mutate<ApiMeeting | null>(key, (cur) => (cur ? { ...cur, status: "ongoing", started_at: cur.started_at ?? new Date().toISOString() } : cur));
      void teamwork.startMeeting(projectId, session.status === "none" ? { name: "Team meeting", minutes: session.minutes || 45 } : {}).then(set);
    },
    schedule,
    /** Leaving: the meeting ends for everyone once the last person has left. */
    end: () => {
      if (!meeting || meeting.status !== "ongoing") return;
      void teamwork.leaveMeeting(projectId, meeting.id).then(set);
    },
    /** Undo a planning change: put back what was planned before (or cancel, if nothing was). */
    restore: (prev: Session) => {
      if (prev.status === "upcoming" && prev.when) schedule({ name: prev.name, minutes: prev.minutes, when: prev.when });
      else if (prev.status === "none" && meeting?.status === "scheduled") void teamwork.cancelMeeting(projectId, meeting.id).then((m) => { if (m && key) mutate<ApiMeeting | null>(key, () => null); });
    },
    /** Joining a meeting that's already happening (the call screen calls this as it opens). */
    join: (seat: { camera: boolean; mic: boolean } = { camera: false, mic: false }) => {
      if (meeting?.status === "ongoing") void teamwork.joinMeeting(projectId, meeting.id, seat).then(set);
    },
  };
}

export const useNextSession: typeof useLocalNextSession = DEMO ? useLocalNextSession : useRemoteNextSession;
