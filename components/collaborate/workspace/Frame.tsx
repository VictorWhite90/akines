"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Bell, ChevronDown, SlidersHorizontal } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import NotFound from "@/components/kin/NotFound";
import { toast } from "@/components/kin/Toast";
import { ME } from "@/lib/collab/me";
import { useDecisions } from "@/lib/collab/decisions";
import { isMine, useProjectSettings, useWorkspace, workspaceHref, WORKSPACE_PAGES, type WorkspacePage } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { ago, Dot as PartDot, Over, type Tone } from "./parts";
import { ConfirmDialog, EditDetailsDialog, NotificationsPanel, PrefsDialog, ProjectAi, SettingsMenu, SwitchMenu, type ProjectNote } from "./ProjectPanels";
import Rail, { useNeedsReview } from "./Rail";
import "../styles/pages.css";
import "../styles/workspace.css";
import "../styles/meeting-card.css";

/*
 * A project's workspace frame, mirrored from the product design (classes cw-* and cd-* in ../styles): the project
 * bar (name, phase, switch project, team pulse, next milestone, notifications, Create AI, settings), the numbered
 * workspace menu, the page, and either a context column or the project rail. Pages pass which menu item is current.
 * A project that doesn't exist, or isn't the member's, shows the not-found page.
 */

export { workspaceHref, useWorkspace };
export function Dot({ tone, size = 8 }: { tone: Tone; size?: number }) {
  return <PartDot tone={tone} size={size} />;
}

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function ProjectBar({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const router = useRouter();
  const pathname = usePathname();
  const { settings, prefs, read, open: openToAll, put } = useProjectSettings(projectId);
  const review = useNeedsReview(projectId);
  const decisions = useDecisions(projectId);
  const [menu, setMenu] = useState<"switcher" | "notifications" | "settings" | null>(null);
  const [dialog, setDialog] = useState<"edit" | "archive" | "leave" | "prefs" | null>(null);
  const [ai, setAi] = useState(false);
  const switchRef = useRef<HTMLElement | null>(null);
  const bellRef = useRef<HTMLElement | null>(null);
  const settingsRef = useRef<HTMLElement | null>(null);
  const aiRef = useRef<HTMLButtonElement | null>(null);
  const edge = useRef<HTMLDivElement>(null);
  if (!ws.project) return null;
  const p = ws.project;
  const base = workspaceHref(p.id);

  const toggle = (m: NonNullable<typeof menu>) => setMenu((cur) => (cur === m ? null : m));
  const shut = (m: NonNullable<typeof menu>) => setMenu((cur) => (cur === m ? null : cur));
  const refocus = (el: HTMLElement | null) => requestAnimationFrame(() => el?.focus({ preventScroll: true }));

  // Notifications, from what is waiting on this project.
  const next = ws.milestones.find((m) => !m.done);
  const lastCheckin = [...(p.checkins ?? [])].filter((c) => c.who !== ME).sort((a, b) => b.at - a.at)[0];
  const notes: ProjectNote[] = [
    ...review.work.slice(0, 1).map((w) => ({ id: w.key, title: `Review requested: ${w.title}`, who: w.caption.split(",")[0], when: `${w.at ? ago(w.at) : "Recently"}.`, action: "Review work", href: w.href })),
    ...decisions.awaitingMe.slice(0, 1).map((d) => ({ id: `decision:${d.slug}`, title: `Decision awaiting acknowledgement: ${d.title}`, who: PEOPLE[d.proposedBy]?.name ?? "A member", when: `${ago(d.proposedAt)}.`, action: "Review decision", href: `${base}/decisions/${d.slug}` })),
    ...(lastCheckin ? [{ id: `checkin:${lastCheckin.id}`, title: `New check-in: ${lastCheckin.done.replace(/\.$/, "")}`, who: PEOPLE[lastCheckin.who]?.name ?? "A member", when: `${ago(lastCheckin.at)}.`, action: "Open conversation", href: ws.href("conversations") }] : []),
    ...(next ? [{ id: `milestone:${next.id}`, title: `Milestone approaching: ${next.title}`, who: "Reminder", when: `Due ${next.due}.`, action: "View milestone", href: `${base}/tasks/milestones` }] : []),
  ];
  // Reminders arrive already read; the rest stay new until opened.
  const unread = notes.filter((n) => !n.id.startsWith("milestone:") && !read.includes(n.id)).map((n) => n.id);
  const markRead = (id: string) => put((s) => ({ ...s, read: [...(s.read ?? []), id] }));
  const bellLabel = unread.length ? `Project notifications, ${unread.length} unread` : "Project notifications";

  const details = { name: ws.title, summary: ws.summary, needs: settings.needs ?? p.members.map((m) => m.role).filter((r, i, a) => a.indexOf(r) === i).slice(1).join(", ") };
  const leave = (message: string) => {
    const back = pathname;
    setDialog(null);
    router.push("/collaborate/my-projects");
    toast.show({ message, actionLabel: "Undo", duration: 2500, onAction: () => router.push(back) });
  };

  // Create AI's summary, from the project's own state.
  const done = ws.milestones.filter((m) => m.done).length;
  const decWord = decisions.awaitingMe.length ? `${plural(decisions.awaitingMe.length, "decision is", "decisions are")} waiting for your acknowledgement` : "no decision is waiting for you";
  const answer = `${done} of ${plural(ws.milestones.length, "milestone is", "milestones are")} done${next ? ` and the team is working on ${next.title.charAt(0).toLowerCase()}${next.title.slice(1).replace(/\.$/, "")}, due ${next.due}` : ""}. ${cap(decWord)} and ${plural(review.work.length, "piece of work needs", "pieces of work need")} your review. What happens next is for the team to decide.`;
  const go = [...(review.work[0] ? [{ label: "Review the work", href: review.work[0].href }] : []), ...(review.decisions[0] ? [{ label: "Open the decision", href: review.decisions[0].href }] : [])];

  return (
    <div className="cw-ph">
      <div className="cw-ph__left">
        <p className="cw-ph__name">{ws.title}</p>
        <span className="cw-pill"><Dot tone="accent" />{ws.phase}</span>
        <IconButton variant="secondary" label="Switch project" aria-haspopup="menu" aria-expanded={menu === "switcher"} onClick={(e) => { switchRef.current = e.currentTarget; toggle("switcher"); }}><ChevronDown size={20} strokeWidth={1.4} /></IconButton>
      </div>
      <div className="cw-ph__mid">
        <div className="cw-ph__stat"><span className="cw-ph__lab">TEAM PULSE</span><span className="cw-ph__val"><Dot tone="green" />{ws.pulse}</span></div>
        <span className="cw-ph__div" aria-hidden />
        <div className="cw-ph__stat"><span className="cw-ph__lab">NEXT MILESTONE</span><span className="cw-ph__val">{ws.nextMilestone}</span></div>
      </div>
      <div className="cw-ph__right" ref={edge}>
        <IconButton variant="secondary" label={bellLabel} aria-haspopup="dialog" aria-expanded={menu === "notifications"} onClick={(e) => { bellRef.current = e.currentTarget; toggle("notifications"); }}>
          <Bell size={20} strokeWidth={1.4} />{unread.length ? <i className="cw-ibtn__dot" aria-hidden /> : null}
        </IconButton>
        <Button ref={aiRef} variant="secondary" aria-haspopup="dialog" aria-expanded={ai} onClick={() => setAi(true)}>Create AI</Button>
        <IconButton variant="secondary" label="Project settings" aria-haspopup="menu" aria-expanded={menu === "settings"} onClick={(e) => { settingsRef.current = e.currentTarget; toggle("settings"); }}><SlidersHorizontal size={20} strokeWidth={1.4} /></IconButton>
      </div>

      <SwitchMenu open={menu === "switcher"} onClose={(r) => { shut("switcher"); if (r) refocus(switchRef.current); }} trigger={switchRef} current={p.id} allHref="/collaborate/my-projects"
        projects={ws.mine.map((x) => ({ id: x.id, name: x.id === p.id ? ws.title : x.title, line: `${x.stage <= 2 ? "Planning" : "Building"}. ${x.host === ME ? "You are the owner." : "Team member."}`, href: workspaceHref(x.id) }))} />
      <NotificationsPanel open={menu === "notifications"} onClose={(r) => { shut("notifications"); if (r) refocus(bellRef.current); }} trigger={bellRef} edge={edge} projectName={ws.title} notes={notes} unread={unread}
        onRead={markRead} onReadAll={() => put((s) => ({ ...s, read: [...(s.read ?? []), ...unread] }))} onPreferences={() => setDialog("prefs")} />
      <SettingsMenu open={menu === "settings"} onClose={(r) => { shut("settings"); if (r) refocus(settingsRef.current); }} trigger={settingsRef} edge={edge} openToCollaborators={openToAll} onToggleOpen={(v) => put({ open: v })}
        onEdit={() => setDialog("edit")} onArchive={() => setDialog("archive")} onLeave={() => setDialog("leave")} />
      <ProjectAi open={ai} onClose={() => { setAi(false); requestAnimationFrame(() => aiRef.current?.focus({ preventScroll: true })); }} projectName={ws.title} answer={answer} go={go} />
      <EditDetailsDialog open={dialog === "edit"} onClose={() => setDialog(null)} details={details}
        onSave={(d) => { const before = settings; put({ name: d.name, summary: d.summary, needs: d.needs }); setDialog(null); toast.show({ message: "Project details saved.", actionLabel: "Undo", duration: 2500, onAction: () => put(() => before) }); }} />
      <ConfirmDialog open={dialog === "archive"} onClose={() => setDialog(null)} eyebrow="ARCHIVE PROJECT" title="Archive this project?" description={`${ws.title} moves out of your active projects. The team keeps read access and you can restore it at any time.`}
        confirm="Archive project" keep="Keep project" onConfirm={() => leave("Project archived. You can restore it from My projects.")} />
      <ConfirmDialog open={dialog === "leave"} onClose={() => setDialog(null)} eyebrow="LEAVE PROJECT" title="Leave this project?" description="Your access ends and the team is told. Your work and acknowledgements stay on the project record. If you own the project, you choose a new owner first."
        confirm="Leave project" keep="Stay on project" onConfirm={() => leave("You left the project.")} />
      <PrefsDialog open={dialog === "prefs"} onClose={() => setDialog(null)} name={ws.title} prefs={prefs}
        onSave={(next) => { const before = prefs; put({ prefs: next }); setDialog(null); toast.show({ message: "Notification preferences saved.", actionLabel: "Undo", duration: 2500, onAction: () => put({ prefs: before }) }); }} />
    </div>
  );
}

function WorkspaceNav({ projectId, active }: { projectId: string; active: WorkspacePage }) {
  return (
    <nav className="cw-nav" aria-label="Project workspace">
      <p className="cw-nav__eyebrow">PROJECT WORKSPACE</p>
      <ul className="cw-nav__list">
        {WORKSPACE_PAGES.map((p, i) => (
          <li key={p.key}>
            <Link href={workspaceHref(projectId, p.key)} className="cw-nav__item" aria-current={p.key === active ? "page" : undefined}>
              <span className="cw-nav__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="cw-nav__label">{p.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The frame every workspace page sits in.
 * - `rail`: the project rail on the right (true or "full"; "short" shows only the session and team).
 * - `railHide`: rail review rows to leave out: "file" (work), "decision", or one row's key ("decision:<slug>").
 * - `context`: a context column on the right instead (pages with a quieter right side).
 * - `wide`: no right column; the page takes the space.
 * Pages render their content only when the project exists: check `useWorkspace(id).project` first.
 */
export function WorkspaceFrame({ projectId, active, rail, railHide, context, wide, children }: { projectId: string; active: WorkspacePage; rail?: boolean | "full" | "short"; railHide?: string[]; context?: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  const ws = useWorkspace(projectId);
  if (ws.ready && (!ws.project || !isMine(ws.project))) return <NotFound />;
  const dash = !!rail || !!wide;
  return (
    <div className="cw-ws">
      <ProjectBar projectId={projectId} />
      <div className={cn("cw-ws__grid", wide && "cw-ws__grid--wide", dash && "cw-ws__grid--dash")}>
        <div className="cw-navwrap"><WorkspaceNav projectId={projectId} active={active} /></div>
        <div className={cn("cw-main", dash && "cw-main--dash")}>{ws.project ? children : null}</div>
        {rail ? (
          <aside className="cw-ctx cw-rail" aria-label="Project rail"><WorkspaceRail projectId={projectId} variant={rail === "short" ? "short" : "full"} hide={railHide} /></aside>
        ) : wide ? null : (
          <aside className="cw-ctx" aria-label="Project context">{ws.project ? context : null}</aside>
        )}
      </div>
    </div>
  );
}

/** The project rail (cd-rail): next session, team availability, then, in full, what needs review and the workload. */
export function WorkspaceRail({ projectId, variant, hide }: { projectId: string; variant: "full" | "short"; hide?: string[] }) {
  return <Rail projectId={projectId} variant={variant} hide={hide} />;
}

/** A block in the context column, with its small label. */
export function CtxBlock({ label, rule, children }: { label: string; rule?: boolean; children: React.ReactNode }) {
  return (
    <section className="cw-ctx__block" data-rule={rule === undefined ? undefined : rule ? "on" : "off"}>
      <Over as="h3">{label}</Over>
      {children}
    </section>
  );
}

/** A workspace page's heading: small label, title and lead, with optional back link and extras. */
export function PageHead({ back, label, title, lead, children }: { back?: React.ReactNode; label: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="cw-pagehead" data-m="up">
      {back}
      <Over>{label}</Over>
      <h1 className="cw-pagehead__title">{title}</h1>
      {lead ? <p className="cw-pagehead__lead">{lead}</p> : null}
      {children}
    </header>
  );
}
