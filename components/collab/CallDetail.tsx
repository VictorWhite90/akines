"use client";

import Link from "next/link";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import Icon from "@/components/ui/Icon";
import { STAGE_LABEL, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { AppTrack, firstName } from "./parts";

export default function CallDetail({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const call = co.call(id);

  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  if (!call) {
    return (
      <div className="kh co">
        <div className="co-empty"><h3>This call isn&apos;t available</h3><p>It may have closed, or the link is incomplete.</p><Link href="/collaborate#calls" className="kh-btn amber sm">See open calls</Link></div>
      </div>
    );
  }

  const host = PEOPLE[call.host];
  const mine = co.appFor(call.id);
  const saved = co.state.saved.includes(call.id);

  return (
    <div className="kh co">
      <BackLink fallback="/collaborate#calls" className="co-link" aria-label="Back to open calls">← Open calls</BackLink>
      <section className="co-detail-hero">
        <Pic name={call.photo} sizes="1200px" priority />
        <span className="shade" />
        <div className="tx">
          <span className="co-row">
            <span className="co-chip">{call.orgKind}</span>
            <span className="co-chip">{call.where} · {call.city}</span>
            <span className="co-chip"><Icon name="time" size={13} />{call.closesInDays} days left</span>
          </span>
          <h1>{call.title}</h1>
        </div>
      </section>

      <div className="co-two">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <section className="co-block">
            <h2>About</h2>
            <p>{call.about}</p>
          </section>

          <section className="co-block">
            <h2>Who they&apos;re looking for</h2>
            <div className="co-roles">{call.roles.map((r) => <span key={r}>{r}</span>)}</div>
            <p className="co-muted" style={{ fontSize: 14 }}>A team of {call.teamSize}. {call.level}.</p>
          </section>

          <section className="co-block">
            <h2>What you get, and what you keep</h2>
            <div className="co-facts">
              <div className="co-fact"><small>Fee</small><span>{call.fee}</span></div>
              <div className="co-fact"><small>Rights</small><span>{call.rights}</span></div>
            </div>
          </section>

          <section className="co-block">
            <h2>Timeline</h2>
            <ol className="co-timeline">{call.timeline.map((t) => <li key={t.label}><b>{t.label}</b><span className="co-muted">{t.when}</span></li>)}</ol>
          </section>

          <section className="co-block">
            <h2>How people are chosen</h2>
            <p>{call.selection}</p>
            <AppTrack stage="submitted" />
            <p className="co-muted" style={{ fontSize: 13 }}>You&apos;ll see each step in My applications, and get a notification when anything changes.</p>
          </section>

          <section className="co-block">
            <h2>What to send</h2>
            <ul className="co-checklist">
              {call.materials.map((m) => <li key={m.id}><i aria-hidden>{m.required ? "✓" : "+"}</i><span><b style={{ fontWeight: 600 }}>{m.label}</b>{!m.required && " (optional)"}{m.hint && <small>{m.hint}</small>}</span></li>)}
            </ul>
          </section>
        </div>

        <aside className="co-side">
          <div className="co-apply-card">
            {call.postedByMe ? (
              <>
                <p className="big">You host this call</p>
                <p className="co-muted" style={{ fontSize: 14 }}>See who&apos;s applied, shortlist, talk to people and send offers.</p>
                <Link href={`/collaborate/review/${call.id}`} className="kh-btn blue">Review applications</Link>
              </>
            ) : mine ? (
              <>
                <span className="co-chip ok" style={{ justifySelf: "start" }}>{STAGE_LABEL[mine.stage].applicant}</span>
                <p className="big">You applied as {mine.role}</p>
                <AppTrack stage={mine.stage} />
                {mine.projectId ? <Link href={`/collaborate/projects/${mine.projectId}`} className="kh-btn blue">Open the workspace</Link> : <Link href="/collaborate/applications" className="kh-btn amber">See where it stands</Link>}
              </>
            ) : (
              <>
                <p className="big">{call.fee.split(" · ")[0]}</p>
                <p className="co-muted" style={{ fontSize: 14 }}>Closes in {call.closesInDays} days. It takes about five minutes: pick your role, choose your work, and say why.</p>
                <Link href={`/collaborate/calls/${call.id}/apply`} className="kh-btn amber">Apply to this call</Link>
                <button className="kh-btn outline" onClick={() => co.toggleSave(call.id)} aria-pressed={saved}>{saved ? "Saved" : "Save for later"}</button>
              </>
            )}
          </div>

          <div className="co-card co-pad" style={{ display: "grid", gap: 12 }}>
            <p className="co-eyebrow">Posted by</p>
            <div className="co-host">
              <Avatar person={host} size={44} />
              <div><b style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{host.name}{call.verified && <Icon name="verified" size={14} />}</b><small>{call.org} · {host.role}</small></div>
            </div>
            <p className="co-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{firstName(call.host)} reads every application. No public voting and no ranking by algorithm.</p>
            {!call.postedByMe && <Link href={`/messages/${call.host}`} className="kh-btn outline sm">Ask {firstName(call.host)} a question</Link>}
          </div>
        </aside>
      </div>
    </div>
  );
}
