"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import type { Application } from "@/lib/collab/types";
import { STAGE_LABEL, conversationSlots, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { AppTrack, DemoNote, Thumb, ago, firstName } from "./parts";

type Tab = "active" | "decided";

/** S9: every application shows where it stands, what happened when, and the one thing to do next. */
export default function MyApplications() {
  const co = useCollab({ engine: true });
  const [tab, setTab] = useState<Tab>("active");
  if (!co.ready) return <div className="kh co" aria-busy="true" />;

  const decided = (a: Application) => ["joined", "not-selected", "withdrawn"].includes(a.stage);
  const list = co.myApps.filter((a) => (tab === "active" ? !decided(a) : decided(a)));
  const waitingOnYou = co.myApps.filter((a) => (a.stage === "shortlisted" && !a.slot) || a.stage === "offer").length;

  return (
    <div className="kh co">
      <div className="co-desk-head">
        <div>
          <p className="co-eyebrow">Collaborate</p>
          <h1 style={{ font: "700 30px/1.2 var(--font-manrope), sans-serif", marginTop: 6 }}>My applications</h1>
          <p className="co-muted" style={{ marginTop: 6, fontSize: 15 }}>Where each one stands, what happened when, and anything you need to do. Every applicant hears back.</p>
        </div>
        <Link href="/collaborate#calls" className="kh-btn outline">Find open calls</Link>
      </div>

      <nav className="co-tabs" aria-label="Applications">
        <button className={tab === "active" ? "on" : undefined} onClick={() => setTab("active")}>In progress <span className="n">{co.myApps.filter((a) => !decided(a)).length}</span></button>
        <button className={tab === "decided" ? "on" : undefined} onClick={() => setTab("decided")}>Decided <span className="n">{co.myApps.filter(decided).length}</span></button>
      </nav>

      {waitingOnYou > 0 && tab === "active" && <DemoNote>{waitingOnYou === 1 ? "One application needs" : `${waitingOnYou} applications need`} you.</DemoNote>}

      {list.length ? (
        <div className="co-apps">{list.map((a) => <AppRow key={a.id} a={a} />)}</div>
      ) : (
        <div className="co-empty">
          <h3>{tab === "active" ? "Nothing in progress" : "Nothing decided yet"}</h3>
          <p>{tab === "active" ? "Applications you send appear here, with every step the host takes." : "Offers you accept, and calls that went to someone else, end up here with the host's feedback."}</p>
          <Link href="/collaborate#calls" className="kh-btn amber sm">Browse open calls</Link>
        </div>
      )}
    </div>
  );
}

function AppRow({ a }: { a: Application }) {
  const co = useCollab();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const call = co.call(a.callId);
  if (!call) return null;
  const host = firstName(call.host);
  const latest = a.history[a.history.length - 1];
  const needsYou = (a.stage === "shortlisted" && !a.slot) || a.stage === "offer";

  return (
    <article className={`co-app${needsYou ? " live" : ""}`}>
      <div className="co-app-head">
        <Thumb photo={call.photo} sizes="70px" />
        <div style={{ minWidth: 0 }}>
          <Link href={`/collaborate/calls/${call.id}`} style={{ color: "inherit", textDecoration: "none" }}><h3>{call.title}</h3></Link>
          <small>{a.role} · {call.org} · applied {ago(a.history[0].at)}</small>
        </div>
        <span className={`co-chip ${a.stage === "not-selected" || a.stage === "withdrawn" ? "" : needsYou ? "warn" : "ok"}`}>{STAGE_LABEL[a.stage].applicant}</span>
      </div>

      {a.stage !== "not-selected" && a.stage !== "withdrawn" && <AppTrack stage={a.stage} />}

      {a.stage === "shortlisted" && !a.slot ? (
        <div className="co-update ask">
          <Avatar person={PEOPLE[call.host]} size={28} />
          <div style={{ display: "grid", gap: 10 }}>
            <span><b>{host} shortlisted you.</b> Pick a time for a 20-minute conversation.</span>
            <div className="co-slots">{conversationSlots().map((s) => <button key={s} onClick={() => co.pickSlot(a.id, s)}>{s}</button>)}</div>
          </div>
        </div>
      ) : a.stage === "offer" && a.offer ? (
        <div className="co-offer">
          <div className="co-row"><Avatar person={PEOPLE[call.host]} size={32} /><h4>{host} would like you on the team</h4></div>
          <dl>
            <div><dt>Role</dt><dd>{a.offer.role}</dd></div>
            <div><dt>Fee</dt><dd>{a.offer.fee.split(" · ")[0]}</dd></div>
            <div><dt>Starts</dt><dd>{a.offer.start}</dd></div>
          </dl>
          <p className="co-muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>Accepting opens the project workspace. The first step there is agreeing the terms together: credit, ownership and how money is shared.</p>
          <div className="co-row">
            <button className="kh-btn amber" onClick={() => router.push(`/collaborate/projects/${co.acceptOffer(a.id)}?tab=agree&joined=1`)}>Accept and open the workspace</button>
            <button className="kh-btn outline" onClick={() => window.confirm(`Turn down ${host}'s offer?`) && co.declineOffer(a.id)}>Decline</button>
          </div>
        </div>
      ) : a.stage === "not-selected" && a.feedback ? (
        <div className="co-update"><Avatar person={PEOPLE[call.host]} size={28} /><span><b>{host}:</b> {a.feedback}</span></div>
      ) : a.stage === "joined" && a.projectId ? (
        <div className="co-update ask">
          <Icon name="collaborate" size={20} />
          <span style={{ flex: 1 }}><b>You&apos;re on the team.</b> The workspace has the plan, the studio, the group chat and a room to meet in.</span>
          <Link href={`/collaborate/projects/${a.projectId}`} className="kh-btn blue sm">Open the workspace</Link>
        </div>
      ) : latest?.note ? (
        <div className="co-update"><Avatar person={PEOPLE[call.host]} size={28} /><span>{latest.note}{a.stage === "conversation" && " We'll send a reminder before the call."}</span></div>
      ) : (
        <div className="co-update"><Icon name="time" size={18} /><span>{host} will see your application on their review desk. You&apos;ll be notified when they open it.</span></div>
      )}

      <div className="co-row" style={{ justifyContent: "space-between" }}>
        <button className="co-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? "Hide history" : "Show history"}</button>
        {!["joined", "not-selected", "withdrawn", "offer"].includes(a.stage) && <button className="co-link" style={{ border: 0, background: "none", padding: 0, color: "var(--k-ink-3)" }} onClick={() => window.confirm("Withdraw this application?") && co.withdraw(a.id)}>Withdraw</button>}
      </div>
      {open && (
        <ol className="co-history">
          {[...a.history].reverse().map((h, i) => <li key={i}><time>{ago(h.at)}</time><span><b>{STAGE_LABEL[h.stage].applicant}</b>{h.note ? ` · ${h.note}` : ""}</span></li>)}
        </ol>
      )}
    </article>
  );
}
