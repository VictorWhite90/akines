"use client";

import { useCallback, useMemo } from "react";
import { toast } from "@/components/kin/Toast";
import { mutate, teamwork, useResource, type ApiTool } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { useLocal, newId } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import type { PersonId } from "@/lib/data/people";
import { clock24, daysAgo, on2026, presenceFor, threadFromApi, versionFromApi, versionNumber, type LivePerson, type Thread, type Version } from "@/lib/collab/live";

/*
 * A project's shared document, as the product design's Research Workspace shows it (research-workspace.css, tr-):
 * an outline, the page, where collaborators are writing, comment threads on quoted text, and version history.
 * It is its own resource (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET  document                                 → { title, version, content: { outline, blocks }, threads, versions }
 *   PUT  document                                 ← { title?, content, base_version, note? }  (409 if someone saved since)
 *   POST document/comments                        ← { text, quote, anchor: { tone } }
 *   POST document/comments/:id/replies            ← { text }
 *   POST document/comments/:id/resolve            ← { resolved }
 *   POST document/versions/:n/restore             (saves that version's content as a new version)
 * Until the team first saves, a project's document starts from its summary.
 * The page is kept as the design lays it out: blocks of lines, each line as written, with highlights for
 * comments, a collaborator's selection and cursor, and your caret. The demo keeps edits in the browser, seeded
 * with the design's document for Career Guidance for Everyone; other projects start from their summary.
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
 * Writes one line of the seed: "{soft:three states|cg-amara}" marks text for thread cg-amara, "{strong:…|cg-ayo}" likewise,
 * "{sel:…|amara-obi}" is Amara's selection with his cursor after it, "{caret}" is your caret. "> " starts an indented line.
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
  if (project.id === "career-guidance-for-everyone") {
    // The design's Research Workspace (12.15), word for word. Its people are the design's: Amara Obi, Ayo Bello and Yusuf Danjuma.
    return {
      projectId: project.id,
      title: "Career guidance needs of secondary school students",
      draft: 3,
      outline: [
        { label: "Executive summary", level: 1 }, { label: "Background", level: 1 }, { label: "Methods", level: 1 },
        { label: "Findings", level: 1 }, { label: "Access to guidance", level: 2 }, { label: "Mentors and timing", level: 2 }, { label: "Parent voice", level: 2 },
        { label: "Recommendations", level: 1 }, { label: "References", level: 1 },
      ],
      blocks: [
        h("Executive summary"),
        p("first",
          "This report looks at how secondary school students in {soft:three states|cg-amara} find",
          "and use career guidance. It draws on a survey of 1,240 students and",
          "interviews with 36 teachers and parents.{caret}"),
        p("second",
          "{strong:Only 41% of students had met a career counsellor,|cg-ayo} and most said the first",
          "time was in their final year. Students with a mentor outside school were",
          "twice as likely to name a clear next step."),
        h("Findings"),
        p("first",
          "1. Access is uneven. {sel:Urban schools were four times more likely|amara-obi} to host a",
          "> career day than rural schools."),
        p("item",
          "2. Timing matters. Guidance offered before Year 10 changed subject choices,",
          "> not just university plans."),
        p("item", "3. Parents want a voice. Most asked for a simple way to join sessions."),
        h("Recommendations"),
        p("first",
          "Start guidance earlier, pair every school with a volunteer mentor, and give",
          "parents a short, plain-language summary after each session."),
      ],
      threads: [
        { id: "cg-ayo", tone: "strong", quote: "Only 41% of students had met a career counsellor.", messages: [
          { who: "ayo-bello", at: daysAgo(now, 0, 10, 42), text: "Can we cite the survey year here? Readers will ask." },
          { who: "kemi", at: daysAgo(now, 0, 10, 51), text: "Good catch. Adding the 2025 survey now." },
        ] },
        { id: "cg-amara", tone: "soft", quote: "three states", messages: [
          { who: "amara-obi", at: daysAgo(now, 0, 10, 42), text: "Name the states here so readers do not wait for the methods section." },
        ] },
        // The design counts one resolved comment (resolved by Kemi) without showing it.
        { id: "cg-resolved", tone: "soft", quote: "36 teachers and parents", resolved: true, resolvedBy: "kemi", messages: [
          { who: "yusuf-danjuma", at: daysAgo(now, 1, 15, 5), text: "Is it 36 interviews in all, teachers and parents together?" },
          { who: "kemi", at: daysAgo(now, 1, 15, 30), text: "Yes, 36 in all." },
        ] },
      ],
      versions: [
        { id: "cg-v6", at: daysAgo(now, 0, 10, 42), who: "kemi", what: "3 changes" },
        { id: "cg-v5", at: daysAgo(now, 0, 9, 15), who: "amara-obi", what: "12 changes" },
        { id: "cg-v4", at: daysAgo(now, 1, 16, 20), who: "ayo-bello", what: "5 changes" },
        { id: "cg-v3", at: daysAgo(now, 1, 11, 2), who: "kemi", what: "20 changes" },
        { id: "cg-v2", at: on2026(10, 12, 15, 40), who: "amara-obi", what: "8 changes" },
        { id: "cg-v1", at: on2026(10, 11, 9, 30), who: "kemi", what: "first draft" },
      ],
      presence: [
        { who: "kemi", state: "editing", note: "Editing the executive summary", access: "Owner" },
        { who: "amara-obi", state: "editing", note: "Editing the findings", access: "Can edit" },
        { who: "ayo-bello", state: "commenting", note: "Commenting on the survey year", access: "Can comment" },
        { who: "yusuf-danjuma", state: "away", note: "Last seen yesterday", access: "View only" },
      ],
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

function useLocalDocument(project: Project | undefined) {
  const [all, setAll] = useLocal<Record<string, Edits>>("ak:collab-documents:v2", {});
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
    /** Saves the page (the demo keeps the seeded page). */
    save: (content: Pick<Doc, "outline" | "blocks">, title?: string) => { void content; void title; },
    /** Starts a comment thread on quoted text. */
    comment: (text: string, quote: string, tone: "strong" | "soft" = "soft") => { void text; void quote; void tone; },
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

function docFromApi(project: Project, t: ApiTool | undefined): Doc {
  const seed = seedDoc(project, SEEDED_AT);
  const c = (t?.content ?? {}) as Partial<Pick<Doc, "outline" | "blocks">>;
  const saved = !!t && t.version > 0;
  return {
    ...seed,
    title: saved && t.title ? t.title : seed.title,
    draft: saved ? t.version : seed.draft,
    outline: saved && Array.isArray(c.outline) ? c.outline : seed.outline,
    blocks: saved && Array.isArray(c.blocks) ? c.blocks : seed.blocks,
    threads: t ? t.threads.map((x) => ({ ...threadFromApi(x), quote: x.quote, tone: x.anchor?.tone === "strong" ? "strong" as const : "soft" as const })) : [],
    versions: t?.versions.length ? t.versions.map(versionFromApi) : seed.versions,
    presence: presenceFor(project.members.map((m) => m.id), [], "Editing the summary"),
  };
}

function useRemoteDocument(project: Project | undefined) {
  const pid = project?.id ?? "";
  const key = pid ? `tw:tool:document:${pid}` : null;
  const tool = useResource<ApiTool>(key, () => teamwork.tool(pid, "document"), 15_000);
  const doc = useMemo(() => (project ? docFromApi(project, tool) : undefined), [project, tool]);
  const set = (t: ApiTool | undefined) => { if (t && key) mutate<ApiTool>(key, () => t); };
  return {
    doc,
    reply: (tid: string, text: string) => void teamwork.replyTool(pid, "document", tid, text).then(set),
    resolve: (tid: string, resolved: boolean) => void teamwork.resolveTool(pid, "document", tid, resolved).then(set),
    restore: (v: Version) => {
      const n = versionNumber(v);
      if (n === null) { toast.show({ message: "Nothing has been saved yet, so there's no earlier version to go back to.", duration: 4000 }); return; }
      void teamwork.restoreTool(pid, "document", n).then(set);
    },
    save: (content: Pick<Doc, "outline" | "blocks">, title?: string) => void teamwork.saveTool(pid, "document", { title, content, base_version: tool?.version ?? 0 }).then(set),
    comment: (text: string, quote: string, tone: "strong" | "soft" = "soft") => void teamwork.commentTool(pid, "document", { text, quote, anchor: { tone } }).then(set),
  };
}

export const useDocument: typeof useLocalDocument = DEMO ? useLocalDocument : useRemoteDocument;
