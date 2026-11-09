"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { Empty } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { countsOf, useApplicants, weekdayDate, type Applicant, type ReviewStatus } from "@/lib/collab/applicants";
import { useWorkspace, workspaceHref } from "@/lib/collab/workspace";
import { LOADING_MS } from "../overview-lists/loading";
import { WorkspaceFrame } from "../workspace/Frame";
import { BackLink } from "../workspace/parts";
import { applicantPaths, COMPARE, JOINED_NOTICE, PAGE, ROW, summaryLine } from "./data";
import { ApplicantRow, CompareBar, CompareTable, FilterChips, JoinedNotice, RowSkeleton, type ChipItem, type CompareColumn, type RowHandlers } from "./parts";
import { useReviewer } from "./reviewer";
import "../styles/applicants.css";

/*
 * 12.45 REVIEW APPLICANTS, mirrored from the product design's applicants/Applicants.tsx: a project's applicants
 * (its call's applications, or the ones sent to the project), with the Compare page and the frames that show another
 * state of the list (.../state-<name>). The state frames show that state over the real list without changing it;
 * an action taken there ends on the list.
 */

export type ApplicantsVariant = "loading" | "empty" | "error" | "compare-selected" | "offer-sent" | "joined" | "not-now";

/** "Share the project link": copies the link and says so. */
export function copyLink(path: string, message: string) {
  try { void navigator.clipboard?.writeText(`${window.location.origin}${path}`); } catch { /* the toast answers either way */ }
  toast.show({ message });
}

/** The person a state frame shows in that state: the first one in a status that can lead to it. */
function pick(list: Applicant[], order: ReviewStatus[]) {
  for (const s of order) { const a = list.find((x) => x.status === s); if (a) return a; }
  return list[list.length - 1];
}
/** Statuses a state frame shows instead of the stored ones (display only). */
export function frameOverrides(list: Applicant[], variant?: string): Record<string, Partial<Applicant>> {
  const today = weekdayDate(Date.now());
  if (variant === "offer-sent") { const a = pick(list, ["Talk booked", "Shortlisted", "New"]); return a ? { [a.id]: { status: "Offer sent", offerSent: a.offerSent ?? today } } : {}; }
  if (variant === "joined") { const a = pick(list, ["Offer sent", "Talk booked", "New"]); return a ? { [a.id]: { status: "Joined", joined: a.joined ?? today } } : {}; }
  if (variant === "not-now") { const a = pick(list, ["New", "Shortlisted", "Talk booked"]); return a ? { [a.id]: { status: "Not now" } } : {}; }
  if (variant === "ready") return Object.fromEntries(list.filter((a) => a.status === "New").slice(0, 2).map((a) => [a.id, { status: "Shortlisted" as ReviewStatus }]));
  return {};
}

function Head({ back, project, summary, support }: { back: string; project: string; summary?: string; support?: string }) {
  return (
    <header className="ap-head" data-m="up">
      <BackLink href={back}>{PAGE.back}</BackLink>
      <h1 className="ap-title">{PAGE.title}</h1>
      <p className="ap-lead">{support ?? PAGE.support(project)}</p>
      {summary ? <p className="ap-summary">{summary}</p> : null}
    </header>
  );
}

export function ApplicantsScreen({ projectId, variant }: { projectId: string; variant?: ApplicantsVariant }) {
  const router = useRouter();
  const ws = useWorkspace(projectId);
  const review = useApplicants({ projectId, callId: ws.project?.callId });
  const paths = applicantPaths(projectId);
  const team = workspaceHref(projectId, "team");
  const r = useReviewer(review, "project", paths.list);
  const [filter, setFilter] = useState("All");
  const [failed, setFailed] = useState(variant === "error");
  const loading = variant === "loading" || !review.ready;
  const project = ws.title ?? "";

  // Loading moves on to the list by itself (the design's 2.5 s)
  useEffect(() => {
    if (variant !== "loading") return;
    const t = window.setTimeout(() => router.replace(paths.list), LOADING_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per loading frame
  }, [variant]);

  // Compare selected: the first two people ticked
  const firstTwo = review.list.slice(0, 2).map((a) => a.id).join(",");
  useEffect(() => {
    if (variant === "compare-selected" && review.ready && firstTwo && review.compare.length < 2) review.setCompare(firstTwo.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once the list is there
  }, [variant, review.ready, firstTwo]);

  const over = useMemo(() => frameOverrides(review.list, variant), [review.list, variant]);
  const people = useMemo(() => review.list.map((a) => ({ ...a, ...over[a.id] })), [review.list, over]);

  if (loading) {
    return (
      <WorkspaceFrame projectId={projectId} active="team" wide>
        <div className="ap-page" aria-busy="true">
          <Head back={team} project={project} />
          <div className="ap-list" role="status" aria-label="Loading applicants">{[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}</div>
        </div>
      </WorkspaceFrame>
    );
  }

  if (failed) {
    return (
      <WorkspaceFrame projectId={projectId} active="team" wide>
        <div className="ap-page">
          <Head back={team} project={project} />
          <div data-m="up" role="alert">
            <Empty className="cw-empty" title={PAGE.error.title} text={PAGE.error.text}
              action={<Button arrow="up-right" onClick={() => { setFailed(false); if (variant === "error") router.push(paths.list); }}>{PAGE.error.action}</Button>} />
          </div>
        </div>
      </WorkspaceFrame>
    );
  }

  if (variant === "empty" || people.length === 0) {
    return (
      <WorkspaceFrame projectId={projectId} active="team" wide>
        <div className="ap-page">
          <Head back={team} project={project} support={PAGE.emptySupport(project)} />
          <div data-m="up">
            <Empty className="cw-empty" title={PAGE.empty.title} text={PAGE.empty.text(project)}
              action={<Button arrow="up-right" onClick={() => copyLink(ws.project?.callId ? `/collaborate/projects/${ws.project.callId}` : workspaceHref(projectId), PAGE.linkCopied)}>{PAGE.empty.action}</Button>} />
          </div>
        </div>
      </WorkspaceFrame>
    );
  }

  const counts = countsOf(people);
  const chips: ChipItem[] = PAGE.chips.map((label) => ({ key: label, label, count: label === "All" ? people.length : counts[label as ReviewStatus] }));
  const shown = people.filter((p) => filter === "All" || p.status === filter);
  const ticked = people.filter((p) => review.compare.includes(p.id));
  const joined = people.filter((p) => p.status === "Joined");

  const handlers = (a: Applicant): RowHandlers => ({
    // the slide-out exists for New, Shortlisted and Talk booked; other rows leave View applicant plain, as in the design
    open: a.status === "New" || a.status === "Shortlisted" || a.status === "Talk booked" ? () => r.open(a.id) : undefined,
    shortlist: () => r.shortlist(a.id),
    propose: () => r.propose(a.id),
    offer: () => r.offer(a.id),
    notNow: () => r.notNow(a.id),
    undo: () => r.undo(a.id),
    team,
  });

  return (
    <WorkspaceFrame projectId={projectId} active="team" wide>
      <div className="ap-page">
        <Head back={team} project={project} summary={summaryLine(counts)} />
        {joined.map((p) => <JoinedNotice key={p.id} message={JOINED_NOTICE(p.name, project)} />)}
        <div data-m="up"><FilterChips items={chips} value={filter} onChange={setFilter} label="Filter applicants" /></div>
        {ticked.length >= 2 ? <CompareBar count={ticked.length} names={COMPARE.names(ticked.map((a) => a.name))} onClear={review.clearCompare} onCompare={() => router.push(paths.compare)} /> : null}
        {shown.length === 0 ? <p className="ap-none">{PAGE.none}</p> : (
          <ul className="ap-list" data-m="up" aria-label="Applicants">
            {shown.map((a) => (
              <li key={a.id}>
                <ApplicantRow a={a} group="project" selected={review.compare.includes(a.id)} tickLocked={ticked.length >= 3} onTick={() => review.toggleCompare(a.id)} h={handlers(a)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {r.layer}
    </WorkspaceFrame>
  );
}

/* ------------------------------------------------------------------ Compare */

/** The people ticked on the list, side by side. Opened with fewer than two ticked, it shows the first two. */
export function CompareScreen({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const review = useApplicants({ projectId, callId: ws.project?.callId });
  const paths = applicantPaths(projectId);
  const r = useReviewer(review, "project", paths.list);
  const picked = review.list.filter((a) => review.compare.includes(a.id));
  const cols = picked.length >= 2 ? picked : review.list.slice(0, 2);

  const firstTwo = review.list.slice(0, 2).map((a) => a.id).join(",");
  useEffect(() => {
    if (review.ready && picked.length < 2 && firstTwo) review.setCompare(firstTwo.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once the list is there
  }, [review.ready, firstTwo]);

  const columns: CompareColumn[] = cols.map((a) => ({
    a, status: a.status,
    // the design draws the columns of New and Shortlisted people with their actions, and the Talk booked column without any
    actions: a.status === "New" ? <><Button size="sm" onClick={() => r.shortlist(a.id)}>{ROW.shortlist}</Button><Button size="sm" variant="secondary" onClick={() => r.notNow(a.id)}>{ROW.notNow}</Button></>
      : a.status === "Shortlisted" ? <><Button size="sm" onClick={() => r.propose(a.id)}>{ROW.proposeTimes}</Button><Button size="sm" variant="secondary" onClick={() => r.notNow(a.id)}>{ROW.notNow}</Button></> : null,
  }));

  return (
    <WorkspaceFrame projectId={projectId} active="team" wide>
      <div className="ap-page">
        <header className="ap-head" data-m="up">
          <BackLink href={paths.list}>{COMPARE.back}</BackLink>
          <h1 className="ap-title">{COMPARE.title}</h1>
          <p className="ap-lead">{COMPARE.support(cols.map((a) => a.name))}</p>
        </header>
        {columns.length ? <CompareTable columns={columns} /> : null}
      </div>
      {r.layer}
    </WorkspaceFrame>
  );
}
