"use client";

import Link from "next/link";
import { useState } from "react";
import { FileRow } from "@/components/collab/FileParts";
import { PieceCard, PieceDetail, PieceForm } from "@/components/portfolio/Portfolio";
import Icon, { type IconName } from "@/components/ui/Icon";
import { linkLook } from "@/lib/collab/proof";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { usePortfolio, type Piece } from "@/lib/portfolio";
import { WORK_FIELDS, completeness, levelLabel, rateLabel, useWorkProfile, type WorkProfile } from "@/lib/workprofile";

export const SETUP_STEPS: { id: string; label: string; icon: IconName; hint: string }[] = [
  { id: "work", label: "What you do", icon: "project", hint: "Your field, a headline and years of experience" },
  { id: "skills", label: "Skills", icon: "spark", hint: "What you're good at" },
  { id: "projects", label: "Projects", icon: "creative", hint: "Work you've done: links, files, photos or a write-up" },
  { id: "cv", label: "CV and links", icon: "cv", hint: "Your CV, your links and a short intro" },
  { id: "availability", label: "Availability", icon: "time", hint: "What you're open to, hours and rate" },
  { id: "review", label: "Review", icon: "verified", hint: "Check it and publish" },
];

const editHref = (step: string) => `/profile/work?step=${step}`;

function Sec({ title, step, children, empty }: { title: string; step: string; children?: React.ReactNode; empty?: string }) {
  return (
    <section className="wk-sec">
      <header><h3>{title}</h3><Link href={editHref(step)} className="wk-edit" aria-label={`Edit ${title.toLowerCase()}`}><Icon name="edit" size={16} /></Link></header>
      {children ?? <Link href={editHref(step)} className="wk-missing">+ {empty}</Link>}
    </section>
  );
}

/** Everything in a work profile, laid out to read. `own` adds edit buttons and the project tools. */
export function WorkProfileBody({ wp, projects, own = true, onOpenProject }: { wp: WorkProfile; projects: Piece[]; own?: boolean; onOpenProject?: (p: Piece) => void }) {
  const field = WORK_FIELDS.find((f) => f.id === wp.field);
  const co = useCollab();
  // Work other people approved on Akines: the part of a profile nobody can just claim.
  // Collaboration still runs on sample data in the browser, so only the demo shows approvals from it.
  const verified = !DEMO ? [] : co.projects.flatMap((p) => (p.deliverables ?? []).filter((d) => d.owner === ME && d.status === "approved").map((d) => ({ d, p }))).sort((a, b) => (b.d.approvedAt ?? 0) - (a.d.approvedAt ?? 0));
  const rate = rateLabel(wp.rate);
  return (
    <div className="wk-body">
      <section className="wk-top">
        {field && <span className="wk-field-chip"><Icon name={field.icon} size={14} />{field.id}{wp.level ? ` · ${levelLabel(wp.level)}` : ""}</span>}
        <h2>{wp.headline || <span className="co-muted">Your headline goes here</span>}</h2>
        <div className="wk-facts">
          {wp.openTo.length > 0 && <span><Icon name="spark" size={14} />Open to {wp.openTo.slice(0, 3).join(", ").toLowerCase()}</span>}
          {wp.where && <span><Icon name="place" size={14} />{wp.where === "Both" ? "In person or remote" : wp.where}{wp.area ? ` · ${wp.area}` : ""}</span>}
          {wp.hours && <span><Icon name="time" size={14} />{wp.hours}</span>}
          {rate && <span><Icon name="chart" size={14} />{rate}</span>}
        </div>
      </section>

      {(wp.about || own) && <Sec title="About" step="cv" empty="Write a short intro">{wp.about ? <p className="wk-story">{wp.about}</p> : undefined}</Sec>}

      {(wp.skills.length > 0 || own) && <Sec title="Skills" step="skills" empty="Add your skills">{wp.skills.length ? <div className="wk-tags">{wp.skills.map((s) => <span key={s}>{s}</span>)}</div> : undefined}</Sec>}

      {verified.length > 0 && (
        <section className="wk-sec">
          <header><h3><span className="wk-verified-ic"><Icon name="verified" size={15} /></span>Verified work · {verified.length}</h3></header>
          <p className="co-muted" style={{ fontSize: 13, margin: "-4px 0 0" }}>Delivered in collaborations on Akines and approved by the person who checked it.</p>
          <ul className="wk-verified">
            {verified.map(({ d, p }) => (
              <li key={d.id}>
                <Link href={`/collaborate/projects/${p.id}?tab=work&d=${d.id}`}>
                  <b>{d.title}</b>
                  <span>{p.title}</span>
                  <small><Icon name="verified" size={12} />Approved by {PEOPLE[d.approver].name}{d.approvedAt ? ` · ${new Date(d.approvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Sec title={`Projects${projects.length ? ` · ${projects.length}` : ""}`} step="projects" empty="Add a project">
        {projects.length ? <div className="wk-grid">{projects.map((p) => <PieceCard key={p.id} piece={p} onOpen={() => onOpenProject?.(p)} />)}</div> : undefined}
      </Sec>

      {(wp.links.length > 0 || wp.cv || own) && (
        <Sec title="CV and links" step="cv" empty="Add your CV or links">
          {wp.links.length || wp.cv ? (
            <ul className="co-items">
              {wp.cv && <FileRow f={wp.cv} />}
              {wp.links.map((l) => { const k = linkLook(l); return <li key={l.url} className="co-item"><span className="ic"><Icon name={k.icon} size={18} /></span><span className="t"><b>{k.label}</b><a href={l.url} target="_blank" rel="noopener noreferrer nofollow">{k.short}</a></span></li>; })}
            </ul>
          ) : undefined}
          {wp.languages.length > 0 && <p className="co-muted" style={{ fontSize: 13, marginTop: 10 }}>Speaks {wp.languages.join(", ")}</p>}
        </Sec>
      )}
    </div>
  );
}

/** The Work tab on your own profile. */
export default function WorkTab() {
  const w = useWorkProfile();
  const pf = usePortfolio();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Piece | null>(null);
  if (!w.ready) return <div className="wk-body" aria-busy="true" />;
  const { wp } = w;
  const { parts, pct } = completeness(wp, pf.pieces.length);
  const started = !!wp.field || pf.pieces.length > 0 || wp.skills.length > 0;
  const next = parts.find((p) => !p.done);
  const open = openId ? pf.get(openId) : undefined;

  if (!started) {
    return (
      <section className="wk-start">
        <span className="wk-start-ic"><Icon name="cv" size={26} /></span>
        <h2>Build your work profile</h2>
        <p>Five quick steps, all optional: what you do, your skills, a few projects (links, files, photos or a write-up) and your CV. It goes with you when you apply to open calls and join projects.</p>
        <ol className="wk-start-steps">{SETUP_STEPS.slice(0, 5).map((s) => <li key={s.id}><span><Icon name={s.icon} size={16} /></span><b>{s.label}</b><small>{s.hint}</small></li>)}</ol>
        <div className="wk-row">
          <Link href="/profile/work" className="kh-btn amber">Start · about 3 minutes</Link>
          {DEMO && <button type="button" className="kh-btn outline" onClick={w.fillExample}>See an example</button>}
        </div>
      </section>
    );
  }

  return (
    <>
      {!wp.publishedAt && (
        <div className="wk-draft"><Icon name="private" size={18} /><span><b>Draft.</b> Only you can see this until you publish.</span><Link href={editHref(next ? next.id : "review")} className="kh-btn amber sm">Continue setup</Link></div>
      )}
      {wp.publishedAt && pct < 100 && next && (
        <Link href={editHref(next.id)} className="wk-meter">
          <span className="bar"><i style={{ width: `${pct}%` }} /></span>
          <span><b>Your work profile is {pct}% complete.</b> Add {next.label.toLowerCase()} next.</span>
          <Icon name="more" size={16} />
        </Link>
      )}
      <div className="wk-actions">
        <Link href="/profile/work" className="kh-btn outline sm"><Icon name="edit" size={15} />Edit work profile</Link>
        <button type="button" className="kh-btn amber sm" onClick={() => setEditing({} as Piece)}><Icon name="upload" size={15} />Add a project</button>
      </div>
      <WorkProfileBody wp={wp} projects={pf.pieces} onOpenProject={(p) => setOpenId(p.id)} />
      {open && !editing && <PieceDetail piece={open} onClose={() => setOpenId(null)} onEdit={() => setEditing(open)} onRemove={() => { pf.remove(open.id); setOpenId(null); }} />}
      {editing && <PieceForm piece={editing.id ? editing : undefined} onClose={() => setEditing(null)} />}
    </>
  );
}
