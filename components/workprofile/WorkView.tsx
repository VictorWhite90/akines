"use client";

import Link from "next/link";
import { useState } from "react";
import { FileRow } from "@/components/collab/FileParts";
import { PieceCard, PieceDetail, PieceForm } from "@/components/portfolio/Portfolio";
import Icon, { type IconName } from "@/components/ui/Icon";
import { linkLook } from "@/lib/collab/proof";
import { DEMO } from "@/lib/demo/mode";
import { usePortfolio, type Piece } from "@/lib/portfolio";
import { WORK_FIELDS, completeness, monthLabel, rateLabel, useWorkProfile, type WorkProfile } from "@/lib/workprofile";

export const SETUP_STEPS: { id: string; label: string; icon: IconName; hint: string }[] = [
  { id: "work", label: "What you do", icon: "project", hint: "Your field, a headline and your level" },
  { id: "skills", label: "Skills", icon: "spark", hint: "What you're good at" },
  { id: "experience", label: "Experience", icon: "team", hint: "Jobs, freelance, your own business, volunteering" },
  { id: "education", label: "Education", icon: "study", hint: "Schools, courses and certificates" },
  { id: "projects", label: "Projects", icon: "creative", hint: "Work you've done, shown your way" },
  { id: "availability", label: "Availability", icon: "time", hint: "What you're open to, hours and rate" },
  { id: "about", label: "About and CV", icon: "cv", hint: "A short intro, your links and your CV" },
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
  const rate = rateLabel(wp.rate);
  return (
    <div className="wk-body">
      <section className="wk-top">
        {field && <span className="wk-field-chip"><Icon name={field.icon} size={14} />{field.id}{wp.level ? ` · ${wp.level}` : ""}</span>}
        <h2>{wp.headline || <span className="co-muted">Your headline goes here</span>}</h2>
        <div className="wk-facts">
          {wp.openTo.length > 0 && <span><Icon name="spark" size={14} />Open to {wp.openTo.slice(0, 3).join(", ").toLowerCase()}</span>}
          {wp.where && <span><Icon name="place" size={14} />{wp.where === "Both" ? "In person or remote" : wp.where}{wp.area ? ` · ${wp.area}` : ""}</span>}
          {wp.hours && <span><Icon name="time" size={14} />{wp.hours}</span>}
          {rate && <span><Icon name="chart" size={14} />{rate}</span>}
        </div>
      </section>

      {(wp.about || own) && <Sec title="About" step="about" empty="Write a short intro">{wp.about ? <p className="wk-story">{wp.about}</p> : undefined}</Sec>}

      {(wp.skills.length > 0 || own) && <Sec title="Skills" step="skills" empty="Add your skills">{wp.skills.length ? <div className="wk-tags">{wp.skills.map((s) => <span key={s}>{s}</span>)}</div> : undefined}</Sec>}

      <Sec title={`Projects${projects.length ? ` · ${projects.length}` : ""}`} step="projects" empty="Add a project">
        {projects.length ? <div className="wk-grid">{projects.map((p) => <PieceCard key={p.id} piece={p} onOpen={() => onOpenProject?.(p)} />)}</div> : undefined}
      </Sec>

      {(wp.experience.length > 0 || own) && (
        <Sec title="Experience" step="experience" empty={wp.noExperience ? "Just starting out" : "Add your experience"}>
          {wp.experience.length ? (
            <ol className="wk-timeline">
              {[...wp.experience].sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0) || b.from.localeCompare(a.from)).map((x) => (
                <li key={x.id}>
                  <span className="dot" aria-hidden />
                  <div>
                    <b>{x.title}</b>
                    <span>{x.org} · {x.kind}</span>
                    <small>{monthLabel(x.from)} – {x.current ? "Now" : monthLabel(x.to)}{x.place ? ` · ${x.place}` : ""}</small>
                    {x.summary && <p>{x.summary}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : wp.noExperience ? <p className="co-muted" style={{ fontSize: 14 }}>Just starting out, and building experience through projects.</p> : undefined}
        </Sec>
      )}

      {(wp.education.length > 0 || wp.certificates.length > 0 || own) && (
        <Sec title="Education and certificates" step="education" empty="Add a school, course or certificate">
          {wp.education.length || wp.certificates.length ? (
            <ul className="wk-list">
              {wp.education.map((e) => <li key={e.id}><span className="ic"><Icon name="study" size={17} /></span><div><b>{e.qualification}{e.field ? `, ${e.field}` : ""}</b><small>{e.school}{e.year ? ` · ${e.year}` : ""}</small></div></li>)}
              {wp.certificates.map((c) => <li key={c.id}><span className="ic"><Icon name="verified" size={17} /></span><div><b>{c.name}</b><small>{c.issuer}{c.year ? ` · ${c.year}` : ""}{c.link && <> · <a href={c.link} target="_blank" rel="noopener noreferrer nofollow">View</a></>}</small></div></li>)}
            </ul>
          ) : undefined}
        </Sec>
      )}

      {(wp.links.length > 0 || wp.cv || own) && (
        <Sec title="Links and CV" step="about" empty="Add your links and CV">
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
        <p>Show what you do, the way it suits your work: projects with links, files or photos, your experience, skills and CV. It goes with you when you apply to open calls and join projects.</p>
        <ol className="wk-start-steps">{SETUP_STEPS.slice(0, 7).map((s) => <li key={s.id}><span><Icon name={s.icon} size={16} /></span><b>{s.label}</b><small>{s.hint}</small></li>)}</ol>
        <div className="wk-row">
          <Link href="/profile/work" className="kh-btn amber">Start · about 5 minutes</Link>
          {DEMO && <button type="button" className="kh-btn outline" onClick={w.fillExample}>See an example</button>}
        </div>
      </section>
    );
  }

  return (
    <>
      {!wp.publishedAt && (
        <div className="wk-draft"><Icon name="private" size={18} /><span><b>Draft.</b> Only you can see this until you publish.</span><Link href={editHref(next?.id === "about" || !next ? "review" : next.id)} className="kh-btn amber sm">Continue setup</Link></div>
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
