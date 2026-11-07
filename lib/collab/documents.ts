"use client";

import { useCallback, useMemo } from "react";
import { useLocal, newId } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import type { PersonId } from "@/lib/data/people";
import { ago, clock24, daysAgo, presenceFor, type LivePerson, type Thread, type Version } from "@/lib/collab/live";

/*
 * A project's shared document, as the product design's Research Workspace shows it (research-workspace.css, tr-):
 * an outline, the page, where collaborators are writing, comment threads on quoted text, and version history.
 * Our Project has no documents yet, so this is its own resource, shaped like the REST one it will become:
 *   GET  /collab/projects/:id/document                          → Doc
 *   POST /collab/projects/:id/document/comments/:id/replies     ← { text }
 *   POST /collab/projects/:id/document/comments/:id/resolve     ← { resolved }
 *   POST /collab/projects/:id/document/versions/:id/restore
 * The page is kept as the design lays it out: blocks of lines, each line as written, with highlights for
 * comments, a collaborator's selection and cursor, and your caret. The demo keeps edits in the browser, seeded
 * with documents for the clinic booking and the Kubwa ride study; other projects start from their summary.
 */

/** A run of text on a line: plain, highlighted for a comment, a collaborator's selection (cursor after it), or your caret. */
export type Part = string | { mark: "strong" | "soft"; text: string; thread: string } | { sel: string; cursor: PersonId } | { caret: true };
export type Line = { parts: Part[]; /** A list item's wrapped line, indented. */ cont?: boolean };
export type Block = { kind: "h2"; text: string } | { kind: "p"; variant: "first" | "second" | "item"; lines: Line[] };
export type OutlineItem = { label: string; level: 1 | 2 };
/** A comment thread on quoted text. `tone` matches the highlight on the page. */
export type DocThread = Thread & { quote: string; tone: "strong" | "soft" };

export type Doc = {
  projectId: string;
  title: string;
  draft: number;
  outline: OutlineItem[];
  blocks: Block[];
  threads: DocThread[];
  versions: Version[];
  presence: LivePerson[];
};

/**
 * Writes one line of the seed: "{soft:three states|c2}" marks text for thread c2, "{strong:…|c1}" likewise,
 * "{sel:…|chidi}" is Chidi's selection with his cursor after it, "{caret}" is your caret. "> " starts an indented line.
 */
function line(src: string): Line {
  const cont = src.startsWith("> ");
  const text = cont ? src.slice(2) : src;
  const parts: Part[] = [];
  let at = 0;
  for (const m of text.matchAll(/\{(soft|strong|sel|caret)(?::([^|}]*)\|([^}]*))?\}/g)) {
    if (m.index! > at) parts.push(text.slice(at, m.index));
    const [, kind, body = "", ref = ""] = m;
    parts.push(kind === "caret" ? { caret: true } : kind === "sel" ? { sel: body, cursor: ref as PersonId } : { mark: kind as "soft" | "strong", text: body, thread: ref });
    at = m.index! + m[0].length;
  }
  if (at < text.length) parts.push(text.slice(at));
  return { parts, cont: cont || undefined };
}
const p = (variant: "first" | "second" | "item", ...lines: string[]): Block => ({ kind: "p", variant, lines: lines.map(line) });
const h = (text: string): Block => ({ kind: "h2", text });

/** Breaks a plain paragraph into lines the width of the design's page (it sets each line as written). */
function wrap(text: string, max = 72): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) out.push(cur);
  return out;
}

const SEEDED_AT = Date.now();

function seedDoc(project: Project, now: number): Doc {
  const members = project.members.map((m) => m.id);
  if (project.id === "garki-clinic-booking") {
    return {
      projectId: project.id,
      title: "How patients book and wait at Garki Family Clinic",
      draft: 3,
      outline: [
        { label: "Executive summary", level: 1 }, { label: "Background", level: 1 }, { label: "Methods", level: 1 },
        { label: "Findings", level: 1 }, { label: "Booking by phone", level: 2 }, { label: "Waiting times", level: 2 }, { label: "Reminders", level: 2 },
        { label: "Recommendations", level: 1 }, { label: "References", level: 1 },
      ],
      blocks: [
        h("Executive summary"),
        p("first",
          "This report looks at how patients at Garki Family Clinic book and wait",
          "to be seen. It draws on a survey of {soft:212 patients|gc-c2} and interviews",
          "with 9 nurses, doctors and reception staff.{caret}"),
        p("second",
          "{strong:Most patients waited more than three hours,|gc-c1} and most said they",
          "came early because they could not book a time. Patients who had a",
          "reminder the day before were twice as likely to arrive on time."),
        h("Findings"),
        p("first",
          "1. Booking is uneven. {sel:Calls before 9 am went unanswered most days,|chidi} so",
          "> patients queued at the gate instead."),
        p("item",
          "2. Timing matters. Patients seen before 11 am said the visit took half",
          "> the time of an afternoon visit."),
        p("item", "3. Reminders work. Most patients asked for an SMS the day before."),
        h("Recommendations"),
        p("first",
          "Let patients book a time online, send an SMS reminder the day before, and",
          "keep three walk-in slots each morning for patients without a phone."),
      ],
      threads: [
        { id: "gc-c1", tone: "strong", quote: "Most patients waited more than three hours.", messages: [
          { who: "ayo", at: ago(now, 52), text: "Can we cite the survey month here? The clinic board will ask." },
          { who: ME, at: ago(now, 43), text: "Good catch. Adding the October survey now." },
        ] },
        { id: "gc-c2", tone: "soft", quote: "212 patients", messages: [
          { who: "kwame", at: ago(now, 52), text: "Say when the survey ran so readers do not wait for the methods section." },
        ] },
        { id: "gc-c0", tone: "soft", quote: "9 nurses, doctors and reception staff", resolved: true, resolvedBy: "leila", messages: [
          { who: "leila", at: daysAgo(now, 1, 15, 5), text: "Is it 9 or 10? The notes list ten names." },
          { who: ME, at: daysAgo(now, 1, 15, 30), text: "Nine. One interview was with the same nurse twice." },
        ] },
      ],
      versions: [
        { id: "gc-v6", at: ago(now, 43), who: ME, what: "3 changes" },
        { id: "gc-v5", at: ago(now, 130), who: "chidi", what: "12 changes" },
        { id: "gc-v4", at: daysAgo(now, 1, 16, 20), who: "kwame", what: "5 changes" },
        { id: "gc-v3", at: daysAgo(now, 1, 11, 2), who: ME, what: "20 changes" },
        { id: "gc-v2", at: daysAgo(now, 4, 15, 40), who: "chidi", what: "8 changes" },
        { id: "gc-v1", at: daysAgo(now, 5, 9, 30), who: ME, what: "first draft" },
      ],
      presence: presenceFor(members, [
        { who: ME, state: "editing", note: "Editing the executive summary" },
        { who: "chidi", state: "editing", note: "Editing the findings" },
        { who: "ayo", state: "commenting", note: "Commenting on the survey month" },
      ], "Editing the executive summary"),
    };
  }
  if (project.id === "kubwa-ride-final-year") {
    return {
      projectId: project.id,
      title: "Shared rides on the Kubwa–campus route",
      draft: 2,
      outline: [
        { label: "Executive summary", level: 1 }, { label: "Background", level: 1 }, { label: "Methods", level: 1 },
        { label: "Findings", level: 1 }, { label: "Waiting times", level: 2 }, { label: "Ride timing", level: 2 }, { label: "Trust", level: 2 },
        { label: "Recommendations", level: 1 }, { label: "References", level: 1 },
      ],
      blocks: [
        h("Executive summary"),
        p("first",
          "This report asks whether a shared-ride app could halve the morning wait",
          "on the Kubwa–campus route. It draws on a survey of {soft:62 students|kr-c2} and",
          "a two-week trial of a paper prototype with 14 riders.{caret}"),
        p("second",
          "{strong:Most students waited over 40 minutes for a bus,|kr-c1} and most said the",
          "worst wait was on Monday mornings. Students who shared a ride with a",
          "friend were twice as likely to reach the first lecture on time."),
        h("Findings"),
        p("first",
          "1. Waits are uneven. {sel:Students at the far end of Kubwa waited longest|tunde} for",
          "> a seat on the first bus."),
        p("item",
          "2. Timing matters. Rides leaving before 7 am were almost always full,",
          "> while later rides ran half empty."),
        p("item", "3. Trust comes first. Most riders asked to see the driver's photo first."),
        h("Recommendations"),
        p("first",
          "Start with fixed morning pickups, show each driver's name and photo, and",
          "let riders split the fare in the app before the ride begins."),
      ],
      threads: [
        { id: "kr-c1", tone: "strong", quote: "Most students waited over 40 minutes for a bus.", messages: [
          { who: "efua", at: ago(now, 52), text: "Can we cite the survey dates here? Examiners will ask." },
          { who: "chidi", at: ago(now, 43), text: "Good catch. Adding the dates now." },
        ] },
        { id: "kr-c2", tone: "soft", quote: "62 students", messages: [
          { who: ME, at: ago(now, 52), text: "Say how the 62 were chosen so readers do not wait for the methods section." },
        ] },
        { id: "kr-c0", tone: "soft", quote: "14 riders", resolved: true, resolvedBy: "chidi", messages: [
          { who: "tunde", at: daysAgo(now, 1, 14, 10), text: "Two riders dropped out in week two. Is it still 14?" },
          { who: "chidi", at: daysAgo(now, 1, 14, 40), text: "Yes, 14 started. The methods say how many finished." },
        ] },
      ],
      versions: [
        { id: "kr-v5", at: ago(now, 43), who: "chidi", what: "4 changes" },
        { id: "kr-v4", at: ago(now, 180), who: "tunde", what: "survey results" },
        { id: "kr-v3", at: daysAgo(now, 1, 16, 20), who: "wanjiru", what: "prototype notes" },
        { id: "kr-v2", at: daysAgo(now, 3, 10, 15), who: "chidi", what: "9 changes" },
        { id: "kr-v1", at: daysAgo(now, 6, 9, 30), who: "chidi", what: "first draft" },
      ],
      presence: presenceFor(members, [
        { who: ME, state: "editing", note: "Reading the executive summary" },
        { who: "tunde", state: "editing", note: "Editing the findings" },
        { who: "efua", state: "commenting", note: "Commenting on the survey dates" },
      ], "Reading the executive summary"),
    };
  }
  return {
    projectId: project.id,
    title: project.title,
    draft: 1,
    outline: [{ label: "Summary", level: 1 }],
    blocks: [h("Summary"), p("first", ...wrap(project.summary))],
    threads: [],
    versions: [{ id: `${project.id}-v1`, at: project.createdAt, who: project.host, what: "first draft" }],
    presence: presenceFor(members, [], "Editing the summary"),
  };
}

/** What a member has changed on a document, kept per project. */
type Edits = { threads?: Record<string, Pick<Thread, "messages" | "resolved" | "resolvedBy">>; versions?: Version[] };

export function useDocument(project: Project | undefined) {
  const [all, setAll] = useLocal<Record<string, Edits>>("ak:collab-documents:v1", {});
  const id = project?.id ?? "";
  const edits = all[id];
  const doc = useMemo<Doc | undefined>(() => {
    if (!project) return undefined;
    const d = seedDoc(project, SEEDED_AT);
    if (!edits) return d;
    return { ...d, threads: d.threads.map((t) => ({ ...t, ...edits.threads?.[t.id] })), versions: [...(edits.versions ?? []), ...d.versions] };
  }, [project, edits]);
  const edit = useCallback((f: (e: Edits) => Edits) => setAll((cur) => ({ ...cur, [id]: f(cur[id] ?? {}) })), [id, setAll]);
  const threadOf = (tid: string) => doc?.threads.find((t) => t.id === tid);
  return {
    doc,
    reply: (tid: string, text: string) => { const t = threadOf(tid); if (t) edit((e) => ({ ...e, threads: { ...e.threads, [tid]: { messages: [...t.messages, { who: ME, at: Date.now(), text }], resolved: t.resolved, resolvedBy: t.resolvedBy } } })); },
    resolve: (tid: string, resolved: boolean) => { const t = threadOf(tid); if (t) edit((e) => ({ ...e, threads: { ...e.threads, [tid]: { messages: t.messages, resolved, resolvedBy: resolved ? ME : undefined } } })); },
    restore: (v: Version) => edit((e) => ({ ...e, versions: [{ id: newId("v"), at: Date.now(), who: ME, what: `restored the ${clock24(v.at)} version` }, ...(e.versions ?? [])] })),
  };
}
