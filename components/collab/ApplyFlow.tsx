"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";
import { PieceImage } from "@/components/portfolio/Portfolio";
import { usePortfolio } from "@/lib/portfolio";
import { useWorkProfile } from "@/lib/workprofile";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { linkLook } from "@/lib/collab/proof";
import { DemoNote, firstName } from "./parts";
import ProofStep, { proofCount, proofSummary, type Proof } from "./ProofStep";

const STEPS = ["Your role", "Your work", "Why you", "Review"] as const;

/** Applying to an open call (S2): the work that fits the role (pieces, links, a CV or files) and a tailored statement. */
export default function ApplyFlow({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const pf = usePortfolio();
  const w = useWorkProfile();
  const call = co.call(id);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [proof, setProof] = useState<Proof>({ works: [], links: [], files: [] });
  const works = proof.works;
  const [statement, setStatement] = useState("");
  const [availability, setAvailability] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  if (!call) return <div className="kh co"><div className="co-empty"><h3>This call isn&apos;t available</h3><Link href="/collaborate#calls" className="kh-btn amber sm">See open calls</Link></div></div>;
  const host = firstName(call.host);
  const already = co.appFor(call.id);
  const needsWork = call.materials.some((m) => m.id === "works");

  if (sent || (already && !sent)) {
    return (
      <div className="kh co">
        <section className="co-done">
          <span className="mark"><Icon name="send" size={28} /></span>
          <h1>{sent ? "Application sent" : "You've already applied"}</h1>
          <p>{host} sees it on their review desk now, exactly as you saw it in the preview. Here&apos;s what happens next, and you&apos;ll get a notification at each step.</p>
          <ol className="co-next-steps" style={{ margin: 0, padding: 0 }}>
            <li><i>1</i><div><b>{host} reviews it</b><span>You&apos;ll see &ldquo;Seen by the host&rdquo; when they open it.</span></div></li>
            <li><i>2</i><div><b>A short conversation</b><span>If you&apos;re shortlisted, you pick a time for a 20-minute call.</span></div></li>
            <li><i>3</i><div><b>An offer, or honest feedback</b><span>Everyone hears back. If you&apos;re chosen, you&apos;ll see the role, the fee and the dates.</span></div></li>
            <li><i>4</i><div><b>The workspace opens</b><span>Accept, and you join the team&apos;s workspace: agree the terms first, then start.</span></div></li>
          </ol>
          <DemoNote>In the demo, {host}&apos;s replies arrive within seconds. Watch My applications.</DemoNote>
          <div className="co-row" style={{ justifyContent: "center" }}>
            <Link href="/collaborate/applications" className="kh-btn amber">My applications</Link>
            <Link href="/collaborate#calls" className="kh-btn outline">More open calls</Link>
          </div>
        </section>
      </div>
    );
  }

  const sentWork = proofCount(proof) > 0;
  const can = [!!role, !needsWork || sentWork, statement.trim().length >= 20 && availability.trim().length > 0, true];
  const submit = async () => {
    setSending(true); setError("");
    const r = await co.apply({ callId: call.id, role, works, links: proof.links, files: proof.files, statement: statement.trim(), availability: availability.trim(), materials: Object.fromEntries(call.materials.map((m) => [m.id, m.id === "works" ? sentWork : m.id === "why" ? !!statement.trim() : m.id === "availability" ? !!availability.trim() : false])) });
    setSending(false);
    if (!r.ok) return setError(r.message);
    setSent(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="kh co">
      <BackLink fallback={`/collaborate/calls/${call.id}`} className="co-link">← {call.title}</BackLink>
      <div className="co-flow">
        <div>
          <nav className="co-steps" style={{ ["--n" as string]: STEPS.length } as React.CSSProperties} aria-label="Steps">
            {STEPS.map((s, i) => <button key={s} className={i === step ? "on" : i < step ? "done" : undefined} disabled={i > step} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}>{s}</button>)}
          </nav>
          <div className="co-panel">
            {step === 0 && (
              <>
                <h2>Which role are you applying for?</h2>
                <p className="hint">{call.org} needs a team of {call.teamSize}. Pick the one that fits you best.</p>
                <div className="co-options" role="radiogroup" aria-label="Role">
                  {call.roles.map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={role === r} className={`co-option${role === r ? " on" : ""}`} onClick={() => setRole(r)}>
                      <b>{r}</b><small>{call.fee.split(" · ").find((f) => f.toLowerCase().includes(r.split(" ")[0].toLowerCase())) ?? call.fee.split(" · ")[0]}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <ProofStep role={role} host={host} value={proof} onChange={setProof} />
                {!needsWork && <p className="co-muted" style={{ fontSize: 13, marginTop: -8 }}>Optional for this call.</p>}
              </>
            )}
            {step === 2 && (
              <>
                <h2>Why this, and why you?</h2>
                <p className="hint">A few honest lines for {host}, written for this call. What would you bring, and how would you start?</p>
                <div className="co-field">
                  <label htmlFor="ap-s">Your note to {host} <small>({statement.trim().length}/600, at least 20)</small></label>
                  <textarea id="ap-s" value={statement} maxLength={600} onChange={(e) => setStatement(e.target.value)} placeholder={`e.g. I'd start by spending a morning at ${call.org} to see how it really works…`} />
                </div>
                <div className="co-field">
                  <label htmlFor="ap-a">Your availability</label>
                  <input id="ap-a" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder={`Can you make ${call.timeline.slice(1).map((t) => t.when).join(", ")}?`} />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Ready to send?</h2>
                <p className="hint">Check it&apos;s right. You can withdraw any time before an offer.</p>
                <ul className="co-checklist">
                  {call.materials.map((m) => {
                    const ok = m.id === "works" ? sentWork : m.id === "why" ? !!statement.trim() : m.id === "availability" ? !!availability.trim() : false;
                    return <li key={m.id}><i aria-hidden style={ok ? undefined : { background: "var(--k-muted)", color: "var(--k-ink-3)" }}>{ok ? "✓" : "–"}</i><span>{m.label}{!m.required && " (optional)"}<small>{ok ? (m.id === "works" ? proofSummary(proof) : "Attached") : m.required ? "Missing" : "Not added"}</small></span></li>;
                  })}
                </ul>
              </>
            )}
            <div className="co-flow-foot">
              {step > 0 ? <button className="kh-btn outline" onClick={() => setStep(step - 1)}>Back</button> : <span />}
              {step < STEPS.length - 1
                ? <button className="kh-btn amber" disabled={!can[step]} onClick={() => setStep(step + 1)}>Continue</button>
                : <button className="kh-btn amber" disabled={sending} onClick={submit}><Icon name="send" size={16} />{sending ? "Sending…" : "Send application"}</button>}
            </div>
            {error && <p className="co-err" role="alert">{error}</p>}
          </div>
        </div>

        <aside className="co-preview" aria-label={`What ${host} will see`}>
          <span className="cap">What {host} will see</span>
          <div className="sheet">
            <div className="co-host"><Avatar person={PEOPLE[ME]} size={40} /><div><b>{PEOPLE[ME].name}</b><small>{role || "Choose a role"} · {PEOPLE[ME].city}</small>{w.wp.headline && <small className="co-headline">{w.wp.headline}</small>}</div></div>
            {(proof.links.length > 0 || proof.files.length > 0) && (
              <ul className="co-sent">
                {proof.links.map((l) => { const k = linkLook(l); return <li key={l.url}><Icon name={k.icon} size={14} /><b>{k.label}</b><span>{k.short}</span></li>; })}
                {proof.files.map((f) => <li key={f.id}><Icon name={f.kind === "cv" ? "cv" : "document"} size={14} /><b>{f.kind === "cv" ? "CV" : "File"}</b><span>{f.name}</span></li>)}
              </ul>
            )}
            {works.length > 0 && <div className="co-thumbs">{works.map((w) => pf.get(w)).filter((w) => !!w).map((w) => <span key={w.id} className="wk-thumb"><PieceImage piece={w} sizes="60px" /></span>)}</div>}
            <blockquote>{statement.trim() || <span className="co-muted">Your note appears here.</span>}</blockquote>
            {availability.trim() && <span className="co-chip"><Icon name="event" size={13} />{availability.trim()}</span>}
          </div>
          <p className="co-muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Only {host} and the people they invite to review can see your application.</p>
        </aside>
      </div>
    </div>
  );
}
