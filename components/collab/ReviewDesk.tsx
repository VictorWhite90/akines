"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";
import { MY_WORKS } from "@/lib/collab/seed";
import type { AppStage, Application } from "@/lib/collab/types";
import { STAGE_LABEL, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { DemoNote, Stars, Thumb, ago, firstName } from "./parts";

const COLUMNS: AppStage[] = ["submitted", "viewed", "shortlisted", "conversation", "offer", "joined", "not-selected"];
const TAGS = ["Strong work", "Great fit", "Ask a question", "Future radar"];

/** Calls the member hosts, with what's waiting in each. */
export function ReviewIndex() {
  const co = useCollab({ engine: true });
  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  return (
    <div className="kh co">
      <div className="co-desk-head">
        <div>
          <p className="co-eyebrow">Collaborate</p>
          <h1>Calls you host</h1>
          <p className="co-muted" style={{ marginTop: 6, fontSize: 15 }}>Everyone who applies to your calls lands here. Review, shortlist, talk, and send offers, or let people know kindly.</p>
        </div>
        <Link href="/collaborate/new" className="kh-btn amber"><Icon name="spark" size={16} />Post an open call</Link>
      </div>
      {co.hostedCalls.length ? (
        <div className="co-apps">
          {co.hostedCalls.map((c) => {
            const apps = co.apps.filter((a) => a.callId === c.id);
            const fresh = apps.filter((a) => a.stage === "submitted").length;
            return (
              <Link key={c.id} href={`/collaborate/review/${c.id}`} className="co-app" style={{ color: "inherit", textDecoration: "none" }}>
                <div className="co-app-head">
                  <Thumb photo={c.photo} sizes="70px" />
                  <div><h3>{c.title}</h3><small>{apps.length} {apps.length === 1 ? "application" : "applications"} · closes in {c.closesInDays} days</small></div>
                  <span className={`co-chip ${fresh ? "warn" : ""}`}>{fresh ? `${fresh} new` : "Up to date"}</span>
                </div>
                <div className="co-row">{COLUMNS.slice(0, 6).map((s) => <span key={s} className="co-chip dim">{STAGE_LABEL[s].host} · {apps.filter((a) => a.stage === s).length}</span>)}</div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="co-empty"><h3>You haven&apos;t posted a call yet</h3><p>Post one and the applications arrive here, ready to review.</p><Link href="/collaborate/new" className="kh-btn amber sm">Post an open call</Link></div>
      )}
    </div>
  );
}

/** The host's review desk for one call (S3): screen, note, tag, compare, move along, and always reply. */
export default function ReviewDesk({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const fresh = useSearchParams().get("posted") === "1";
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const call = co.call(id);

  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  if (!call || !call.postedByMe) return <div className="kh co"><div className="co-empty"><h3>This isn&apos;t one of your calls</h3><Link href="/collaborate/review" className="kh-btn amber sm">Calls you host</Link></div></div>;

  const apps = co.apps.filter((a) => a.callId === call.id);
  const open = apps.find((a) => a.id === openId) ?? null;
  const project = co.projects.find((p) => p.callId === call.id);

  return (
    <div className="kh co">
      <BackLink fallback="/collaborate/review" className="co-link">← Calls you host</BackLink>
      <div className="co-desk-head">
        <div>
          <p className="co-eyebrow">Review applications</p>
          <h1>{call.title}</h1>
          <p className="co-muted" style={{ marginTop: 6, fontSize: 15 }}>{apps.length} {apps.length === 1 ? "person has" : "people have"} applied. Only you can see this desk; applicants see their own status.</p>
        </div>
        <div className="co-row">
          {compare.length >= 2 && <button className="kh-btn outline" onClick={() => setComparing(true)}>Compare {compare.length}</button>}
          {project && <Link href={`/collaborate/projects/${project.id}`} className="kh-btn blue">Open the project</Link>}
          <Link href={`/collaborate/calls/${call.id}`} className="kh-btn outline">View the call</Link>
        </div>
      </div>

      {fresh && apps.length === 0 && <DemoNote>Your call is live. In the demo, the first applications arrive within a minute; they&apos;ll pop up here and in your notifications.</DemoNote>}

      <div className="co-pipeline" role="list" aria-label="Applications by stage">
        {COLUMNS.map((stage) => {
          const col = apps.filter((a) => a.stage === stage);
          return (
            <section key={stage} className="co-col" role="listitem" aria-label={STAGE_LABEL[stage].host}>
              <header className="co-col-head">{STAGE_LABEL[stage].host}<span>{col.length}</span></header>
              {col.map((a) => {
                const p = PEOPLE[a.applicant];
                return (
                  <div key={a.id} style={{ position: "relative" }}>
                    <button className={`co-applicant${openId === a.id ? " sel" : ""}`} onClick={() => { setOpenId(a.id); if (a.stage === "submitted") co.setAppStage(a.id, "viewed", { note: "You opened the application." }); }}>
                      <span className="top">
                        <Avatar person={p} size={36} />
                        <span style={{ minWidth: 0, flex: 1 }}><b>{p.name}</b><small>{a.role} · {p.city}</small></span>
                        {a.stage === "submitted" && <span className="co-new-dot" aria-label="New" />}
                      </span>
                      <p>{a.statement}</p>
                      <span className="co-row" style={{ gap: 6 }}><Stars value={a.rating} />{a.tags.slice(0, 1).map((t) => <span key={t} className="co-chip blue" style={{ height: 22, fontSize: 11 }}>{t}</span>)}<small style={{ marginLeft: "auto" }}>{ago(a.history[0].at)}</small></span>
                    </button>
                    <label style={{ position: "absolute", right: 10, bottom: -26, fontSize: 11.5, color: "var(--k-ink-3)", display: "flex", gap: 4, alignItems: "center" }}>
                      <input type="checkbox" checked={compare.includes(a.id)} onChange={() => setCompare((c) => (c.includes(a.id) ? c.filter((x) => x !== a.id) : [...c, a.id].slice(-3)))} /> Compare
                    </label>
                    <div style={{ height: 22 }} />
                  </div>
                );
              })}
              {!col.length && <p className="co-muted" style={{ fontSize: 12.5, padding: "4px" }}>No one here yet.</p>}
            </section>
          );
        })}
      </div>

      {open && <ApplicantDrawer a={open} onClose={() => setOpenId(null)} />}
      {comparing && (
        <Sheet title="Side by side" sub="The applications you ticked, next to each other." onClose={() => setComparing(false)} wide>
          <div className="kh co co-compare" style={{ ["--n" as string]: compare.length, gap: 12, paddingBottom: 0 } as React.CSSProperties}>
            {apps.filter((a) => compare.includes(a.id)).map((a) => (
              <div key={a.id} className="co-card co-pad" style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <div className="co-host"><Avatar person={PEOPLE[a.applicant]} size={36} /><div><b>{PEOPLE[a.applicant].name}</b><small>{a.role}</small></div></div>
                <Stars value={a.rating} />
                <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{a.statement}</p>
                <small className="co-muted">Available: {a.availability}</small>
                <span className="co-chip">{STAGE_LABEL[a.stage].host}</span>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function ApplicantDrawer({ a, onClose }: { a: Application; onClose: () => void }) {
  const co = useCollab();
  const call = co.call(a.callId)!;
  const p = PEOPLE[a.applicant];
  const [note, setNote] = useState("");
  const [declining, setDeclining] = useState(false);
  const [feedback, setFeedback] = useState(`Thank you for applying, ${firstName(a.applicant)}. We went with someone whose work is closer to what this call needs, but we'd love to see you apply to the next one.`);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const works = a.applicant === "amara" ? a.works.map((w) => MY_WORKS.find((x) => x.id === w)!).filter(Boolean) : [];
  const next: Partial<Record<AppStage, { to: AppStage; label: string; note: string }>> = {
    submitted: { to: "shortlisted", label: "Shortlist", note: "You shortlisted them. They'll pick a time to talk." },
    viewed: { to: "shortlisted", label: "Shortlist", note: "You shortlisted them. They'll pick a time to talk." },
    shortlisted: { to: "conversation", label: "Mark the conversation done", note: "You had your conversation." },
    conversation: { to: "offer", label: "Send an offer", note: `You offered them the ${a.role} role.` },
  };
  const step = next[a.stage];

  return (
    <>
      <div className="co-drawer-scrim" onClick={onClose} aria-hidden />
      <aside className="co-drawer kh co" style={{ gap: 0, paddingBottom: 0 }} role="dialog" aria-modal="true" aria-label={`${p.name}'s application`}>
        <header className="co-drawer-head">
          <Avatar person={p} size={48} />
          <div><h2>{p.name}</h2><small className="co-muted">{a.role} · {p.role} · {p.city}</small></div>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="co-drawer-body">
          <div className="co-row" style={{ justifyContent: "space-between" }}>
            <span className="co-chip blue">{STAGE_LABEL[a.stage].host}</span>
            <Stars value={a.rating} onChange={(n) => co.rate(a.id, n)} />
          </div>
          {a.slot && a.stage === "shortlisted" && <div className="co-update ask"><Icon name="event" size={18} /><span>{firstName(a.applicant)} picked <b>{a.slot}</b> for your conversation.</span></div>}

          <section className="co-block">
            <h2 style={{ fontSize: 15 }}>Their note to you</h2>
            <p style={{ fontSize: 14.5 }}>{a.statement}</p>
            <span className="co-chip"><Icon name="event" size={13} />{a.availability}</span>
          </section>

          {works.length > 0 && (
            <section className="co-block">
              <h2 style={{ fontSize: 15 }}>Work they chose</h2>
              <div className="co-works">{works.map((w) => <div key={w.id} className="co-work"><span className="ph"><Thumb photo={w.photo} className="" sizes="160px" /></span><b>{w.title}</b><small>{w.kind}</small></div>)}</div>
            </section>
          )}

          <section className="co-block">
            <h2 style={{ fontSize: 15 }}>Eligibility</h2>
            <ul className="co-elig">
              {call.materials.map((m) => {
                const ok = a.materials[m.id];
                return <li key={m.id} className={ok || !m.required ? undefined : "miss"}><i aria-hidden>{ok ? "✓" : m.required ? "!" : "–"}</i>{m.label}{!ok && !m.required && " (optional, not sent)"}</li>;
              })}
            </ul>
          </section>

          <section className="co-block">
            <h2 style={{ fontSize: 15 }}>Tags <small className="co-muted" style={{ fontWeight: 400 }}>only you see these</small></h2>
            <div className="co-tagset">{TAGS.map((t) => <button key={t} className={a.tags.includes(t) ? "on" : undefined} aria-pressed={a.tags.includes(t)} onClick={() => co.toggleTag(a.id, t)}>{t}</button>)}</div>
          </section>

          <section className="co-block">
            <h2 style={{ fontSize: 15 }}>Private notes</h2>
            <form className="co-inline-form" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { co.addNote(a.id, note.trim()); setNote(""); } }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only you can see this" aria-label="Add a private note" />
              <button className="kh-btn outline sm" disabled={!note.trim()}>Save</button>
            </form>
            {a.notes.length > 0 && <ul className="co-notes" style={{ margin: 0, padding: 0 }}>{a.notes.map((n, i) => <li key={i}><time>{ago(n.at)}</time>{n.text}</li>)}</ul>}
          </section>

          <section className="co-block">
            <h2 style={{ fontSize: 15 }}>History</h2>
            <ol className="co-history">{[...a.history].reverse().map((h, i) => <li key={i}><time>{ago(h.at)}</time><span><b>{STAGE_LABEL[h.stage].host}</b>{h.note ? ` · ${h.note}` : ""}</span></li>)}</ol>
          </section>

          {declining && (
            <section className="co-block">
              <h2 style={{ fontSize: 15 }}>Your message to {firstName(a.applicant)}</h2>
              <p className="co-muted" style={{ fontSize: 13 }}>Everyone hears back. A line on why, and what to try next, means a lot.</p>
              <div className="co-field"><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} aria-label="Feedback" /></div>
            </section>
          )}
        </div>
        <footer className="co-drawer-foot">
          {declining ? (
            <>
              <button className="kh-btn outline" onClick={() => setDeclining(false)}>Cancel</button>
              <button className="kh-btn amber" disabled={feedback.trim().length < 10} onClick={() => { co.setAppStage(a.id, "not-selected", { feedback: feedback.trim(), note: "You let them know, with feedback." }); onClose(); }}>Send and close</button>
            </>
          ) : a.stage === "joined" ? (
            <Link href={`/collaborate/projects/${a.projectId}`} className="kh-btn blue">Open the project</Link>
          ) : a.stage === "offer" ? (
            <p className="co-muted" style={{ fontSize: 13.5 }}>Offer sent. When {firstName(a.applicant)} accepts, they join the project workspace.</p>
          ) : a.stage === "not-selected" || a.stage === "withdrawn" ? (
            <p className="co-muted" style={{ fontSize: 13.5 }}>{a.stage === "withdrawn" ? "They withdrew." : "They've been told, with your feedback."}</p>
          ) : (
            <>
              <Link href={`/messages/${a.applicant}`} className="kh-btn outline">Message</Link>
              <button className="kh-btn outline" onClick={() => setDeclining(true)}>Not this time</button>
              {step && <button className="kh-btn amber" onClick={() => co.setAppStage(a.id, step.to, { note: step.note })}>{step.label}</button>}
            </>
          )}
        </footer>
      </aside>
    </>
  );
}
