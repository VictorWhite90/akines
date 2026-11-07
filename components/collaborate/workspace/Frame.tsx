"use client";

import Link from "next/link";
import { Bell, ChevronDown, SlidersHorizontal } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { useWorkspace, WORKSPACE_PAGES, type WorkspacePage } from "@/lib/collab/workspace";
import { cn } from "@/lib/cn";
import "../styles/pages.css";
import "../styles/workspace.css";
import "../styles/meeting-card.css";

/*
 * A project's workspace frame, mirrored from the product design (classes cw-* and cd-* in ../styles): the project
 * bar (name, phase, team pulse, next milestone, notifications, Create AI, settings), the numbered workspace menu,
 * the page, and either a context column or the project rail. Pages pass which menu item is current.
 */

export function Dot({ tone, size = 8 }: { tone: "accent" | "green" | "gray"; size?: number }) {
  return <i className={`cw-dot cw-dot--${tone}`} style={{ ["--cw-dot" as string]: `${size}px` } as React.CSSProperties} aria-hidden />;
}

/** The project bar. The switch, notifications, Create AI and settings controls open their panels (see ProjectBarPanels). */
function ProjectBar({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  if (!ws.project) return null;
  return (
    <div className="cw-ph">
      <div className="cw-ph__left">
        <p className="cw-ph__name">{ws.project.title}</p>
        <span className="cw-pill"><Dot tone="accent" />{ws.phase}</span>
        <IconButton variant="secondary" label="Switch project" aria-haspopup="menu" aria-expanded={false}><ChevronDown size={20} strokeWidth={1.5} /></IconButton>
      </div>
      <div className="cw-ph__mid">
        <div className="cw-ph__stat"><span className="cw-ph__lab">TEAM PULSE</span><span className="cw-ph__val"><Dot tone="green" />{ws.pulse}</span></div>
        <span className="cw-ph__div" aria-hidden />
        <div className="cw-ph__stat"><span className="cw-ph__lab">NEXT MILESTONE</span><span className="cw-ph__val">{ws.nextMilestone}</span></div>
      </div>
      <div className="cw-ph__right">
        <IconButton variant="secondary" label="Project notifications" aria-haspopup="dialog" aria-expanded={false}><Bell size={20} strokeWidth={1.5} /></IconButton>
        <Button variant="secondary" aria-haspopup="dialog" aria-expanded={false}>Create AI</Button>
        <IconButton variant="secondary" label="Project settings" aria-haspopup="menu" aria-expanded={false}><SlidersHorizontal size={20} strokeWidth={1.5} /></IconButton>
      </div>
    </div>
  );
}

function WorkspaceNav({ projectId, active }: { projectId: string; active: WorkspacePage }) {
  const ws = useWorkspace(projectId);
  if (!ws.project) return null;
  return (
    <nav className="cw-nav" aria-label="Project workspace">
      <p className="cw-nav__eyebrow">PROJECT WORKSPACE</p>
      <ul className="cw-nav__list">
        {WORKSPACE_PAGES.map((p, i) => (
          <li key={p.key}>
            <Link href={ws.href(p.key)} className="cw-nav__item" aria-current={p.key === active ? "page" : undefined}>
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
 * - `rail`: the project rail on the right (overview "full"; "short" shows only the session and team).
 * - `context`: a context column on the right instead (pages with a quieter right side).
 * - `wide`: no right column; the page takes the space.
 */
export function WorkspaceFrame({ projectId, active, rail, railHide, context, wide, children }: { projectId: string; active: WorkspacePage; rail?: "full" | "short"; railHide?: string[]; context?: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  const dash = !!rail || !!wide;
  return (
    <div className="cw-ws">
      <ProjectBar projectId={projectId} />
      <div className={cn("cw-ws__grid", wide && "cw-ws__grid--wide", dash && "cw-ws__grid--dash")}>
        <div className="cw-navwrap"><WorkspaceNav projectId={projectId} active={active} /></div>
        <div className={cn("cw-main", dash && "cw-main--dash")}>{children}</div>
        {rail ? (
          <aside className="cw-ctx cw-rail" aria-label="Project rail"><WorkspaceRail projectId={projectId} variant={rail} hide={railHide} /></aside>
        ) : wide ? null : (
          <aside className="cw-ctx" aria-label="Project context">{context}</aside>
        )}
      </div>
    </div>
  );
}

/** The project rail (cd-rail): next session, team availability, then, in full, what needs review and the workload. */
export function WorkspaceRail({ projectId, variant, hide }: { projectId: string; variant: "full" | "short"; hide?: string[] }) {
  void projectId; void hide;
  return <div className={cn("cd-rail", variant === "short" && "cd-rail--short")} />;
}

/** A block in the context column, with its small label. */
export function CtxBlock({ label, rule, children }: { label: string; rule?: boolean; children: React.ReactNode }) {
  return (
    <section className="cw-ctx__block" data-rule={rule === undefined ? undefined : rule ? "on" : "off"}>
      <h3 className="cw-over">{label}</h3>
      {children}
    </section>
  );
}

/** A workspace page's heading: small label, title and lead, with optional back link and extras. */
export function PageHead({ back, label, title, lead, children }: { back?: React.ReactNode; label: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="cw-pagehead" data-m="up">
      {back}
      <p className="cw-over">{label}</p>
      <h1 className="cw-pagehead__title">{title}</h1>
      {lead ? <p className="cw-pagehead__lead">{lead}</p> : null}
      {children}
    </header>
  );
}
