"use client";

import { useCallback } from "react";
import { useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { PersonId } from "@/lib/data/people";

/*
 * A project's team meetings, as the product design shows them: the next session on the workspace rail
 * (meeting-card.css, mt-), and the meeting itself (meeting.css, mc-): the lobby, the call and the end.
 * Our Project has no meetings yet, so this is its own resource, shaped like the REST one it will become:
 *   GET  /collab/projects/:id/meetings/next    → Session
 *   POST /collab/projects/:id/meetings         ← { name, minutes, when } (schedule) or { now: true } (start now)
 *   POST /collab/projects/:id/meetings/end
 *   GET  /collab/projects/:id/meetings/call    → Call (who is in the room, with camera and microphone)
 * Nothing is recorded or sent: the camera and microphone only show your own preview (components/collaborate/tools/media.ts).
 * It shares its store with lib/collab/session.ts (same key and shape), so the rail and the meeting agree.
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

const SEED: Record<string, Session> = {
  "garki-clinic-booking": { status: "upcoming", name: "Booking screens review", day: "THU", time: "4 PM", when: "Thursday, 4:00 PM", minutes: 45 },
  "market-light": { status: "upcoming", name: "Layout review", day: "THU", time: "4 PM", when: "Thursday, 4:00 PM", minutes: 45 },
};
const NONE: Session = { status: "none", name: "Team meeting", day: "", time: "", when: "", minutes: 45 };

const CALLS: Record<string, Call> = {
  "garki-clinic-booking": {
    here: [{ who: "kwame", camera: true, mic: true }, { who: "wanjiru", camera: true, mic: true }, { who: "leila", camera: false, mic: false }],
    chat: [{ who: "kwame", text: "I can see the second screen now." }, { who: "leila", text: "Could we look at the last question again?" }],
  },
  "market-light": {
    here: [{ who: "wanjiru", camera: true, mic: true }, { who: "efua", camera: false, mic: false }],
    chat: [{ who: "wanjiru", text: "I can see the second spread now." }, { who: "efua", text: "Could we look at the cover again?" }],
  },
};
const EMPTY: Call = { here: [], chat: [] };

const clock = (d = new Date()) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?([ap])m/i, (_, a: string) => ` ${a.toUpperCase()}M`);
export { clock as meetingClock };

/** A project's next session as seeded, for places that only need to read it once. Use `useNextSession` to follow changes. */
export const nextSession = (projectId: string): Session => SEED[projectId] ?? NONE;
/** Who is in a project's call right now, apart from you. */
export const callOf = (projectId: string): Call => {
  const c = CALLS[projectId] ?? EMPTY;
  return { ...c, here: c.here.filter((s) => s.who !== ME) };
};

export function useNextSession(projectId: string) {
  const [all, setAll] = useLocal<Record<string, Session>>("ak:collab-sessions:v1", SEED);
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
  };
}
