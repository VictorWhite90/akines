"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriorityMark, StatusMark } from "@/components/collaborate/workspace/Tasks";
import { initialsOf } from "@/components/collaborate/workspace/parts";
import { PEOPLE } from "@/lib/data/people";
import { DECISIONS_PAGE, LOADING_COUNT, OL, TASKS_PAGE, countOf } from "./data";
import { useFirstVisit } from "./loading";
import { AwaitingDecisionRow, EmptyPanel, ListPage, SkeletonList } from "./parts";
import { useOverview } from "./probe";
import "../styles/tasks.css";

/*
 * Two lists behind the Collaborate Home count tiles, mirrored from the product design (overview-lists/Lists.tsx):
 * 12.48 Decisions awaiting you and 12.50 Tasks due this week, read across all the member's projects. A list
 * shows its Loading frame the first time it is opened in a visit, and while our data is still coming; Empty is
 * the real one, and both also have a "state-" route.
 */

type Variant = "empty" | "loading" | undefined;

function useLoading(key: string, variant: Variant, listPath: string, ready: boolean) {
  const router = useRouter();
  const first = useFirstVisit(key, { stateRoute: variant === "loading", skip: !!variant, onDone: () => router.replace(listPath) });
  return first || (variant !== "empty" && !ready);
}

/** 12.48 Decisions awaiting you. */
export function DecisionsList({ variant }: { variant?: Variant }) {
  const o = useOverview();
  const loading = useLoading("ol-decisions", variant, OL.decisions, o.ready);
  const rows = variant === "empty" ? [] : o.decisions;
  const P = DECISIONS_PAGE;
  return (
    <ListPage eyebrow={P.eyebrow} title={P.title} lead={P.lead} tab={P.tab} count={loading ? LOADING_COUNT : countOf(rows.length, "decision", "decisions")} busy={loading}>
      {o.probes}
      {loading ? <SkeletonList rows={3} />
        : rows.length ? <ul className="ol-box" data-m="up">{rows.map((d) => <AwaitingDecisionRow key={d.id} item={d} />)}</ul>
          : <EmptyPanel {...P.empty} />}
    </ListPage>
  );
}

/** 12.50 Tasks due this week: the Task Row of the Tasks screens, each opening the Tasks list of its project. */
export function TasksList({ variant }: { variant?: Variant }) {
  const o = useOverview();
  const loading = useLoading("ol-tasks", variant, OL.tasks, o.ready);
  const rows = variant === "empty" ? [] : o.tasks;
  const P = TASKS_PAGE;
  return (
    <ListPage eyebrow={P.eyebrow} title={P.title} lead={P.lead} tab={P.tab} count={loading ? LOADING_COUNT : countOf(rows.length, "task", "tasks")} busy={loading}>
      {o.probes}
      {loading ? <SkeletonList rows={4} />
        : rows.length ? (
          <ul className="ol-box tk-rows" data-m="up">
            {rows.map((t) => {
              const owner = PEOPLE[t.owner]?.name ?? "A member";
              return (
                <li key={t.id}>
                  <Link href={t.href} className="tk-row">
                    <span className="tk-row__content">
                      <span className="tk-row__title">{t.title}</span>
                      <span className="tk-row__meta"><span className="tk-row__ms">{t.project}</span><PriorityMark priority={t.priority} /></span>
                    </span>
                    <span className="tk-owner" role="img" aria-label={`Responsible: ${owner}`}>{initialsOf(owner)}</span>
                    <span className="tk-row__status"><StatusMark status={t.status} /></span>
                    <span className="tk-row__due">{t.due}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <EmptyPanel {...P.empty} />}
    </ListPage>
  );
}
