import type { ApiToolThread, ApiToolVersion } from "@/lib/api/teamwork";
import { ME } from "@/lib/collab/me";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * What the two shared tools (the canvas in lib/collab/canvas.ts and the document in lib/collab/documents.ts) have in
 * common, as the product design shows it: who is in the tool right now, the versions it keeps, and the comment
 * threads on it. Both resources return these fields the same way, so the tool frame reads either.
 * On the backend both are /api/v1/teamwork/projects/:id/{document,canvas} (lib/api/teamwork.ts): the content is saved
 * as versions (a save names the version it started from, so nobody overwrites work they haven't seen), with comment
 * threads beside it. Who is here right now isn't tracked yet: everyone but you shows as away.
 */

/** What a person is doing in the tool right now. "away" has access but is not here. */
export type LiveState = "editing" | "viewing" | "commenting" | "away";
/** `access` is the person's access in the tool when it differs from the project default (see accessOf). */
export type LivePerson = { who: PersonId; state: LiveState; note: string; access?: Access };

/** Access in the tool follows the project: the host owns it, members can edit. */
export type Access = "Owner" | "Can edit" | "Can comment" | "View only";

export type Version = { id: string; at: number; who: PersonId; /** "colour layer", "3 changes", "new canvas" */ what: string };

export type Message = { who: PersonId; at: number; text: string };
export type Thread = { id: string; messages: Message[]; resolved?: boolean; resolvedBy?: PersonId };

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
export const ago = (now: number, minutes: number) => now - minutes * MIN;
export const daysAgo = (now: number, days: number, h: number, m: number) => { const d = new Date(now - days * DAY); d.setHours(h, m, 0, 0); return d.getTime(); };
/** A fixed day of 2026, as the design writes dates it does not count from today ("12 Oct, 15:40"). month is 1-based. */
export const on2026 = (month: number, day: number, h: number, m: number) => new Date(2026, month - 1, day, h, m).getTime();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
/** "10:42", 24-hour, as the design writes comment times. */
export const clock24 = (at: number) => { const d = new Date(at); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
/** "Today", "Yesterday" or "12 Oct". */
export function dayLabel(at: number, now = Date.now()) {
  const d = new Date(at), n = new Date(now), y = new Date(now - DAY);
  return sameDay(d, n) ? "Today" : sameDay(d, y) ? "Yesterday" : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
/** "Today, 10:42" — a version's time in the history list. */
export const versionTime = (at: number, now = Date.now()) => `${dayLabel(at, now)}, ${clock24(at)}`;
/** "today at 10:42", "yesterday at 16:20", "on 12 Oct at 15:40" — for "last edited". */
export function editedAt(at: number, now = Date.now()) {
  const day = dayLabel(at, now);
  return `${day === "Today" || day === "Yesterday" ? day.toLowerCase() : `on ${day}`} at ${clock24(at)}`;
}

export const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
export const firstName = (id: PersonId) => nameOf(id).split(" ")[0]!;
export const initialsOf = (id: PersonId) => nameOf(id).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
export const accessOf = (id: PersonId, host: PersonId): Access => (id === host ? "Owner" : "Can edit");

/** "4 people have access. 3 are here now." */
export function presenceSummary(people: LivePerson[]) {
  const here = people.filter((p) => p.state !== "away").length;
  return `${people.length} ${people.length === 1 ? "person has" : "people have"} access. ${here} ${here === 1 ? "is" : "are"} here now.`;
}

/** Everyone on the project, with the seeded notes for who is here; you are always here, editing. */
export function presenceFor(members: PersonId[], seeded: LivePerson[], youNote: string): LivePerson[] {
  return members.map((who) => seeded.find((p) => p.who === who) ?? (who === ME ? { who, state: "editing", note: youNote } : { who, state: "away", note: "Not here now" }));
}

// ── From the backend ────────────────────────────────────────────────────────────────────────

const person = (id: string | null) => (id ?? "akines") as PersonId;
export const threadFromApi = (t: ApiToolThread): Thread => ({
  id: t.id, resolved: t.resolved || undefined, resolvedBy: t.resolved_by ? person(t.resolved_by) : undefined,
  messages: t.messages.map((m) => ({ who: person(m.by), at: Date.parse(m.at), text: m.text })),
});
/** Versions are named "v<number>" so restoring one knows which to ask for. */
export const versionFromApi = (v: ApiToolVersion): Version => ({ id: `v${v.number}`, at: Date.parse(v.at), who: person(v.by), what: v.note || "changes" });
export const versionNumber = (v: Version) => { const m = /^v(\d+)$/.exec(v.id); return m ? Number(m[1]) : null; };
