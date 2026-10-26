"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import Icon, { type IconName } from "@/components/ui/Icon";
import type { Project } from "@/lib/collab/types";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { DemoNote, Faces, JourneyBar, Thumb, ago, firstName, nextStep } from "./parts";
import { AgreeTab, ChatTab, PlanTab, PresentTab, PreserveTab, RoomTab, StudioTab, ValueTab } from "./WorkspaceTabs";

export type WsTab = "overview" | "agree" | "plan" | "studio" | "chat" | "room" | "present" | "value" | "preserve";
const TABS: { id: WsTab; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "agree", label: "Agree", icon: "verified" },
  { id: "plan", label: "Plan", icon: "poll" },
  { id: "studio", label: "Studio", icon: "creative" },
  { id: "chat", label: "Chat", icon: "message" },
  { id: "room", label: "Room", icon: "live" },
  { id: "present", label: "Present", icon: "event" },
  { id: "value", label: "Share value", icon: "chart" },
  { id: "preserve", label: "Preserve", icon: "save" },
];

/**
 * A collaboration's workspace (S1, S5–S8): agree the terms first, then plan, make in the studio, talk in the
 * group chat (also in KinMessage), meet live in a room, present, share what it earned, and keep the record.
 */
export default function Workspace({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const router = useRouter();
  const q = useSearchParams();
  const startTab = q.get("tab") ?? undefined;
  const [joined] = useState(q.get("joined") === "1");
  const [tab, setTab] = useState<WsTab>(TABS.some((t) => t.id === startTab) ? (startTab as WsTab) : "overview");
  const p = co.projects.find((x) => x.id === id);

  // Older sample projects get their KinMessage conversation the first time the workspace opens.
  useEffect(() => {
    if (p) co.ensureConvo(p, [{ from: p.host, text: `This is our space for ${p.title}. Everything we decide lands in the workspace too.` }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per project
  }, [p?.id]);

  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  if (!p) return <div className="kh co"><div className="co-empty"><h3>This project isn&apos;t available</h3><p>You may not be on this team yet.</p><Link href="/collaborate#projects" className="kh-btn amber sm">Your projects</Link></div></div>;

  const go = (t: WsTab) => { setTab(t); router.replace(`/collaborate/projects/${p.id}?tab=${t}`, { scroll: false }); };
  const unsigned = !p.charter.signedAt;

  return (
    <div className="kh co" style={{ gap: 24 }}>
      <BackLink fallback="/collaborate#projects" className="co-link">← Collaborate</BackLink>
      <header className="co-ws-head">
        <div className="co-ws-top">
          <Thumb photo={p.photo} sizes="90px" />
          <div style={{ minWidth: 0 }}>
            <p className="co-eyebrow">{p.callId ? `From an open call · ${co.call(p.callId)?.org ?? ""}` : "Project"}</p>
            <h1>{p.title}</h1>
            <p>{p.summary}</p>
          </div>
          <div className="co-ws-acts">
            <Link href={`/messages/${p.convoId}`} className="kh-btn outline"><Icon name="message" size={16} />Team chat</Link>
            <button className="kh-btn outline" onClick={() => router.push(co.project.startRoom(p))}><Icon name="live" size={16} />Meet live</button>
            <button className="kh-btn amber" onClick={() => go("studio")}><Icon name="creative" size={16} />Studio</button>
          </div>
        </div>
        <JourneyBar stage={p.stage} />
        <div className="co-row" style={{ justifyContent: "space-between" }}>
          <span className="co-row"><Faces ids={p.members.map((m) => m.id)} size={30} /><span className="co-muted" style={{ fontSize: 13.5 }}>{p.members.map((m) => (m.id === ME ? "You" : firstName(m.id))).join(", ")}</span></span>
          {unsigned && p.stage >= 2 && <button className="co-chip warn" style={{ border: 0 }} onClick={() => go("agree")}><Icon name="verified" size={13} />Charter not signed yet</button>}
        </div>
      </header>

      {joined && <DemoNote>Welcome to the team. Agree the terms first: once everyone has signed, the plan and the studio open up for work.</DemoNote>}

      <nav className="co-tabs" aria-label="Workspace">
        {TABS.map((t) => <button key={t.id} className={tab === t.id ? "on" : undefined} onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined}><Icon name={t.icon} size={16} />{t.label}{t.id === "agree" && unsigned && p.stage >= 2 && <span className="co-new-dot" aria-label="Needs signing" />}</button>)}
      </nav>

      {tab === "overview" && <Overview p={p} go={go} />}
      {tab === "agree" && <AgreeTab p={p} />}
      {tab === "plan" && <PlanTab p={p} go={go} />}
      {tab === "studio" && <StudioTab p={p} />}
      {tab === "chat" && <ChatTab p={p} />}
      {tab === "room" && <RoomTab p={p} />}
      {tab === "present" && <PresentTab p={p} />}
      {tab === "value" && <ValueTab p={p} />}
      {tab === "preserve" && <PreserveTab p={p} />}
    </div>
  );
}

function Overview({ p, go }: { p: Project; go: (t: WsTab) => void }) {
  const co = useCollab();
  const doneTasks = p.tasks.filter((t) => t.status === "done").length;
  const doneMs = p.milestones.filter((m) => m.done).length;
  const action: { label: string; tab: WsTab } = p.stage === 1 ? { label: "Open the idea canvas", tab: "studio" } : !p.charter.signedAt ? { label: "Read and sign the charter", tab: "agree" } : p.tasks.some((t) => t.who === ME && t.status !== "done") ? { label: "See your tasks", tab: "plan" } : { label: "Open the studio", tab: "studio" };
  const thread = co.thread(p);
  const lastMsg = thread[thread.length - 1];

  return (
    <div className="co-ws-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="co-next-card">
          <p className="co-eyebrow">Next up</p>
          <h3>{nextStep(p, ME)}</h3>
          {p.stage === 1 && <p>You&apos;re at the idea stage. Add references and sketches to the studio together, then move on to agreeing the terms.</p>}
          {p.stage === 2 && !p.charter.signedAt && <p>Before anyone starts, the team agrees credit, ownership, decisions, money and how to leave. Work opens when everyone has signed.</p>}
          <div className="co-row">
            <button className="kh-btn amber" onClick={() => go(action.tab)}>{action.label}</button>
            {p.stage === 1 && <button className="kh-btn outline" onClick={() => { co.project.toAgree(p.id); go("agree"); }}>Ready to agree terms</button>}
          </div>
        </section>

        <div className="co-facts">
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("plan")}>
            <small>Tasks</small><span><b style={{ fontSize: 22 }}>{doneTasks}/{p.tasks.length}</b> done</span>
            <span className="co-progress"><i style={{ width: `${p.tasks.length ? (doneTasks / p.tasks.length) * 100 : 0}%` }} /></span>
          </button>
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("plan")}>
            <small>Milestones</small><span><b style={{ fontSize: 22 }}>{doneMs}/{p.milestones.length}</b> reached</span>
            <span className="co-progress"><i style={{ width: `${p.milestones.length ? (doneMs / p.milestones.length) * 100 : 0}%` }} /></span>
          </button>
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("studio")}>
            <small>Studio</small><span><b style={{ fontSize: 22 }}>{p.studio.length}</b> pieces · {p.studio.filter((s) => s.tag === "Final").length} final</span>
          </button>
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("chat")}>
            <small>Group chat</small><span>{lastMsg ? <>{lastMsg.from === ME ? "You" : lastMsg.from === "ai" ? "Akines" : firstName(lastMsg.from)}: {"text" in lastMsg ? lastMsg.text?.slice(0, 60) : "…"}</> : "Say hello to the team"}</span>
          </button>
        </div>

        <section className="co-card co-pad" style={{ display: "grid", gap: 14 }}>
          <div className="co-sec-head"><h2 style={{ fontSize: 17 }}>Recent activity</h2><button className="co-link" style={{ border: 0, background: "none" }} onClick={() => go("preserve")}>Full record →</button></div>
          <ul className="co-activity">
            {[...p.ledger].reverse().slice(0, 6).map((l, i) => (
              <li key={i}>
                {l.who === "akines" ? <span className="co-ak"><Icon name="verified" size={14} /></span> : <Avatar person={PEOPLE[l.who]} size={28} />}
                <span>{l.who === "akines" ? "" : <b>{l.who === ME ? "You" : firstName(l.who)} </b>}{l.what}<time>{ago(l.at)}</time></span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="co-card co-pad" style={{ display: "grid", gap: 14 }}>
          <h2 style={{ font: "600 16px var(--font-manrope)" }}>The team</h2>
          <ul className="co-team">
            {p.members.map((m) => (
              <li key={m.id}>
                <Avatar person={PEOPLE[m.id]} size={38} />
                <div style={{ minWidth: 0 }}><b>{m.id === ME ? `${PEOPLE[m.id].name} (you)` : PEOPLE[m.id].name}</b><small>{m.contribution && m.contribution !== m.role ? `${m.role} · ${m.contribution}` : m.role}</small></div>
                {p.charter.signed.includes(m.id) ? <span className="co-chip ok">Signed</span> : p.stage >= 2 ? <span className="co-chip">Not signed</span> : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="co-card co-pad" style={{ display: "grid", gap: 10 }}>
          <h2 style={{ font: "600 16px var(--font-manrope)" }}>Everything in one place</h2>
          {([["agree", "Charter: credit, ownership, money"], ["plan", "Plan: tasks and milestones"], ["studio", "Studio: drafts, references, finals"], ["room", "Room: meet live, together"], ["value", "Share value: budget and splits"]] as [WsTab, string][]).map(([t, l]) => (
            <button key={t} className="co-link" style={{ border: 0, background: "none", padding: 0, textAlign: "left" }} onClick={() => go(t)}>{l} →</button>
          ))}
        </section>
      </aside>
    </div>
  );
}
