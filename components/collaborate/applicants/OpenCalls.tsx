"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import NotFound from "@/components/kin/NotFound";
import { Empty } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { countsOf, useApplicants, weekdayDate, type Applicant } from "@/lib/collab/applicants";
import { profileOf } from "@/lib/collab/projects";
import { parseDue } from "@/lib/collab/tasks";
import { useCollab } from "@/lib/collab/useCollab";
import type { CollabCall } from "@/lib/collab/types";
import { BackLink, CwLink, Over } from "../workspace/parts";
import { copyLink, frameOverrides } from "./Applicants";
import { CALL_PAGE, CALLS_PAGE, CALLS_PATH, COMPARE, LINKS, PAGE, ROW, applicantPaths, callPaths, plural } from "./data";
import { CloseCallModal, StartProjectModal } from "./modals";
import { ApplicantRow, CompareBar, CompareTable, FilterChips, Notice, type ChipItem, type CompareColumn, type RowHandlers } from "./parts";
import { useReviewer } from "./reviewer";
import "../styles/pages.css";
import "../styles/workspace.css";
import "../styles/applicants.css";

/*
 * 12.46 OPEN CALL REVIEW, mirrored from the product design's applicants/OpenCalls.tsx: the calls you host that have
 * no project yet (useCollab hostedCalls), and one call's applicants with Compare, Close call and Start project.
 * Stage comes from the call's profile (lib/collab/projects), the closing date from its timeline.
 */

/** "Tue 10 Nov": the call's "Applications close" date. */
function closesOf(call: CollabCall) {
  const when = call.timeline.find((t) => /close/i.test(t.label))?.when;
  const at = when ? parseDue(when) : Date.now() + call.closesInDays * 86_400_000;
  return at ? weekdayDate(at) : (when ?? "");
}
const lookingFor = (call: CollabCall) => call.roles.join(", ");

function CallStatus({ open }: { open: boolean }) {
  return <span className={open ? "ap-callstatus" : "ap-callstatus ap-callstatus--closed"}>{open ? CALLS_PAGE.open : CALLS_PAGE.closed}</span>;
}

/* ------------------------------------------------------------------ Open calls list */

function CallRow({ call }: { call: CollabCall }) {
  const review = useApplicants({ callId: call.id });
  const open = !review.closedAt;
  const date = open ? closesOf(call) : weekdayDate(review.closedAt!);
  return (
    <article className="ap-callrow">
      <div className="ap-callrow__left">
        <h2 className="ap-callrow__title">{call.title}</h2>
        <p className="ap-callrow__line">{CALLS_PAGE.meta(profileOf(call).stage, lookingFor(call))}</p>
        <p className="ap-callrow__line">{open ? CALLS_PAGE.closes(date) : CALLS_PAGE.closedOn(date)}</p>
      </div>
      <div className="ap-callrow__right">
        <CallStatus open={open} />
        <p className="ap-callrow__count">{plural(review.list.length, "applicant")}</p>
        <Button size="sm" variant="secondary" href={callPaths(call.id).call} className="ap-callrow__go">
          {CALLS_PAGE.review}<span className="sr-only"> {call.title}</span>
        </Button>
      </div>
    </article>
  );
}

export function OpenCallsScreen({ variant }: { variant?: "empty" }) {
  const collab = useCollab();
  const calls = collab.hostedCalls.filter((c) => !collab.projects.some((p) => p.callId === c.id));
  const empty = variant === "empty" || (collab.ready && calls.length === 0);
  return (
    <div className="ap-wide ap-wide--list">
      <BackLink href={LINKS.myProjects}>{CALLS_PAGE.back}</BackLink>
      <header className="ap-listhead" data-m="up">
        <div className="ap-listhead__text">
          <Over className="cw-over--12">{CALLS_PAGE.label}</Over>
          <h1 className="ap-listhead__title">{CALLS_PAGE.title}</h1>
          <p className="ap-lead">{CALLS_PAGE.lead}</p>
        </div>
        <CwLink href={LINKS.start}>{CALLS_PAGE.post}</CwLink>
      </header>
      {empty ? (
        <div data-m="up">
          <Empty className="cw-empty" title={CALLS_PAGE.empty.title} text={CALLS_PAGE.empty.text} action={<Button href={LINKS.start} arrow="up-right">{CALLS_PAGE.empty.action}</Button>} />
        </div>
      ) : (
        <ul className="ap-list" data-m="up" aria-label="Open calls">
          {calls.map((c) => <li key={c.id}><CallRow call={c} /></li>)}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ The call */

export type CallVariant = "empty" | "compare-selected" | "ready" | "closed";

function CallHeader({ call, open, date, count }: { call: CollabCall; open: boolean; date: string; count: number }) {
  return (
    <header className="ap-callhead" data-m="up">
      <div className="ap-callhead__eyebrow">
        <Over className="cw-over--12">{open ? CALL_PAGE.eyebrow : CALL_PAGE.eyebrowClosed}</Over>
        <CallStatus open={open} />
      </div>
      <h1 className="ap-callhead__title">{call.title}</h1>
      <dl className="ap-meta">
        <div><dt><Over className="cw-over--12">{CALL_PAGE.stage}</Over></dt><dd>{profileOf(call).stage}</dd></div>
        <div><dt><Over className="cw-over--12">{CALL_PAGE.lookingFor}</Over></dt><dd>{lookingFor(call)}</dd></div>
        <div><dt><Over className="cw-over--12">{open ? CALL_PAGE.closes : CALL_PAGE.closedOn}</Over></dt><dd>{date}</dd></div>
        <div><dt><Over className="cw-over--12">{CALL_PAGE.applicants}</Over></dt><dd>{plural(count, "applicant")}</dd></div>
      </dl>
      <Notice title={CALL_PAGE.noProject.title} text={CALL_PAGE.noProject.text} />
    </header>
  );
}

/** A call you host, or nothing: someone else's call, or one that already has a project (that goes to the project's applicants). */
function useHostedCall(callId: string) {
  const collab = useCollab();
  const router = useRouter();
  const call = collab.hostedCalls.find((c) => c.id === callId);
  const project = collab.projects.find((p) => p.callId === callId);
  useEffect(() => { if (project) router.replace(applicantPaths(project.id).list); }, [project, router]);
  return { ready: collab.ready, call: project ? undefined : call, moved: !!project };
}

export function CallScreen({ callId, variant }: { callId: string; variant?: CallVariant }) {
  const router = useRouter();
  const { ready, call, moved } = useHostedCall(callId);
  const review = useApplicants({ callId });
  const paths = callPaths(callId);
  const r = useReviewer(review, "call", paths.call);
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState<"close" | "start" | null>(null);
  const [now] = useState(() => Date.now());

  const firstTwo = review.list.slice(0, 2).map((a) => a.id).join(",");
  useEffect(() => {
    if (variant === "compare-selected" && review.ready && firstTwo && review.compare.length < 2) review.setCompare(firstTwo.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once the list is there
  }, [variant, review.ready, firstTwo]);

  const over = useMemo(() => frameOverrides(review.list, variant), [review.list, variant]);
  const people: Applicant[] = useMemo(() => review.list.map((a) => ({ ...a, ...over[a.id] })), [review.list, over]);

  if (!ready || moved) return <div className="ap-wide" aria-busy="true" />;
  if (!call) return <NotFound />;

  const empty = variant === "empty" || people.length === 0;
  const open = variant === "closed" ? false : !review.closedAt;
  const date = open ? closesOf(call) : weekdayDate(review.closedAt ?? now);
  const counts = countsOf(people);
  // a call's "shortlisted" includes the people who have since booked their talk
  const isShort = (a: Applicant) => a.status === "Shortlisted" || a.status === "Talk booked";
  const chips: ChipItem[] = ["All", ...call.roles, "Shortlisted"].map((label) => ({
    key: label, label,
    count: label === "All" ? people.length : label === "Shortlisted" ? counts.Shortlisted + counts["Talk booked"] : people.filter((p) => p.wants === label).length,
  }));
  const shown = people.filter((p) => filter === "All" || (filter === "Shortlisted" ? isShort(p) : p.wants === filter));
  const ticked = people.filter((p) => review.compare.includes(p.id));
  const shortlisted = people.filter(isShort).map((p) => p.first);

  // View applicant opens the slide-out of a New person; Not now on a call's row is plain, as in the design
  const handlers = (a: Applicant): RowHandlers => ({ open: a.status === "New" ? () => r.open(a.id) : undefined, shortlist: () => r.shortlist(a.id) });

  return (
    <div className="ap-wide">
      <BackLink href={CALLS_PATH}>{CALL_PAGE.back}</BackLink>
      <CallHeader call={call} open={open} date={date} count={empty ? 0 : people.length} />
      {empty ? (
        <div data-m="up">
          <Empty className="cw-empty" title={CALL_PAGE.empty.title} text={CALL_PAGE.empty.text}
            action={<Button arrow="up-right" onClick={() => copyLink(`/collaborate/projects/${call.id}`, CALL_PAGE.linkCopied)}>{CALL_PAGE.empty.action}</Button>} />
        </div>
      ) : (
        <>
          {open ? null : (
            <div className="ap-closed" data-m="up">
              <Notice title={CALL_PAGE.closedNotice.title(date)} text={CALL_PAGE.closedNotice.text} />
              <Button variant="secondary" arrow="up-right" onClick={() => { review.reopenCall(); if (variant === "closed") router.push(paths.call); }}>{CALL_PAGE.closedNotice.reopen}</Button>
            </div>
          )}
          <div className="ap-filterrow" data-m="up">
            <FilterChips items={chips} value={filter} onChange={setFilter} label="Filter applicants" />
            {open ? <CwLink onClick={() => setModal("close")}>{CALL_PAGE.closeCall}</CwLink> : null}
          </div>
          {ticked.length >= 2 ? <CompareBar count={ticked.length} names={COMPARE.names(ticked.map((a) => a.name))} onClear={review.clearCompare} onCompare={() => router.push(paths.compare)} /> : null}
          {shown.length === 0 ? <p className="ap-none">{PAGE.none}</p> : (
            <ul className="ap-list" data-m="up" aria-label="Applicants">
              {shown.map((a) => (
                <li key={a.id}>
                  <ApplicantRow a={a} group="call" selected={review.compare.includes(a.id)} tickLocked={ticked.length >= 3} onTick={() => review.toggleCompare(a.id)} h={handlers(a)} />
                </li>
              ))}
            </ul>
          )}
          <div className="ap-start" data-m="up">
            <Button arrow="up-right" disabled={shortlisted.length === 0} onClick={() => setModal("start")}>{CALL_PAGE.start}</Button>
            <p className="ap-start__help">{shortlisted.length === 0 ? CALL_PAGE.helperNone : CALL_PAGE.helper(shortlisted)}</p>
          </div>
        </>
      )}
      <CloseCallModal open={modal === "close"} onClose={() => setModal(null)} onConfirm={() => { review.closeCall(); setModal(null); toast.show({ message: CALL_PAGE.closedToast }); }} />
      <StartProjectModal open={modal === "start"} names={shortlisted} onClose={() => setModal(null)} onConfirm={() => { setModal(null); router.push(LINKS.start); }} />
      {r.layer}
    </div>
  );
}

/* ------------------------------------------------------------------ Compare */

/** The people ticked in the call, side by side. Shortlist goes back to the list, as the frame does; Not now stays plain. */
export function CallCompareScreen({ callId }: { callId: string }) {
  const router = useRouter();
  const { ready, call } = useHostedCall(callId);
  const review = useApplicants({ callId });
  const paths = callPaths(callId);
  const picked = review.list.filter((a) => review.compare.includes(a.id));
  const cols = picked.length >= 2 ? picked : review.list.slice(0, 2);
  const firstTwo = review.list.slice(0, 2).map((a) => a.id).join(",");
  useEffect(() => {
    if (review.ready && picked.length < 2 && firstTwo) review.setCompare(firstTwo.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once the list is there
  }, [review.ready, firstTwo]);

  if (!ready) return <div className="ap-wide" aria-busy="true" />;
  if (!call) return <NotFound />;

  const columns: CompareColumn[] = cols.map((a) => ({
    a, status: a.status,
    actions: a.status === "New"
      ? <><Button size="sm" onClick={() => { review.shortlist(a.id); router.push(paths.call); }}>{ROW.shortlist}</Button><Button size="sm" variant="secondary">{ROW.notNow}</Button></>
      : a.status === "Shortlisted" || a.status === "Talk booked" ? <Button size="sm" variant="secondary">{ROW.notNow}</Button> : null,
  }));

  return (
    <div className="ap-wide">
      <BackLink href={paths.call}>{COMPARE.back}</BackLink>
      <header className="ap-head" data-m="up">
        <h1 className="ap-title">{COMPARE.title}</h1>
        <p className="ap-lead">{COMPARE.support(cols.map((a) => a.name))}</p>
      </header>
      {columns.length ? <CompareTable columns={columns} /> : null}
    </div>
  );
}
