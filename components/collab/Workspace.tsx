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
import { kitOf } from "@/lib/collab/kits";
import WorkTab, { Checkins, MyDeliverables, ReviewQueue, toReview } from "./WorkTab";
import { AgreeTab, ChatTab, PreserveTab, RoomTab, StudioTab, ValueTab } from "./WorkspaceTabs";

export type WsTab = "home" | "agree" | "work" | "chat" | "room" | "value" | "record";
const TABS: { id: WsTab; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "agree", label: "Agree", icon: "verified" },
  { id: "work", label: "Work", icon: "project" },
  { id: "chat", label: "Chat", icon: "message" },
  { id: "room", label: "Room", icon: "live" },
  { id: "value", label: "Share value", icon: "chart" },
  { id: "record", label: "Record", icon: "save" },
];
/** Older links (and bell notices) used the tab names from before the Work tab. */
const OLD_TABS: Record<string, WsTab> = { overview: "home", plan: "work", studio: "work", present: "work", preserve: "record" };

/**
 * A collaboration's workspace (S1, S5–S8), the same for any kind of work and shaped by it (lib/collab/kits):
 * agree the terms, then deliver what each person promised, with proof, review and approval; talk in the group
 * chat (also in KinMessage), meet in a room, share what it earned, and keep the record. The work itself
 * happens in the team's own tools, pinned in the Work tab.
 */
export default function Workspace({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const router = useRouter();
  const q = useSearchParams();
  const raw = q.get("tab") ?? "";
  const startTab = OLD_TABS[raw] ?? raw;
  const [joined] = useState(q.get("joined") === "1");
  const [tab, setTab] = useState<WsTab>(TABS.some((t) => t.id === startTab) ? (startTab as WsTab) : "home");
  const [openD, setOpenD] = useState<string | null>(q.get("d"));
  const p = co.projects.find((x) => x.id === id);

  // Older sample projects get their KinMessage conversation the first time the workspace opens.
  useEffect(() => {
    if (p) co.ensureConvo(p, [{ from: p.host, text: `This is our space for ${p.title}. Everything we decide lands in the workspace too.` }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per project
  }, [p?.id]);

  if (!co.ready) return <div className="kh co" aria-busy="true" />;
  if (!p) return <div className="kh co"><div className="co-empty"><h3>This project isn&apos;t available</h3><p>You may not be on this team yet.</p><Link href="/collaborate#projects" className="kh-btn amber sm">Your projects</Link></div></div>;

  const go = (t: WsTab) => { setTab(t); if (t !== "work") setOpenD(null); router.replace(`/collaborate/projects/${p.id}?tab=${t}`, { scroll: false }); };
  const openDeliverable = (id: string) => { setOpenD(id); setTab("work"); router.replace(`/collaborate/projects/${p.id}?tab=work&d=${id}`, { scroll: false }); };
  const reviews = toReview(p).length;
  const unsigned = !p.charter.signedAt;

  return (
    <div className="kh co" style={{ gap: 24 }}>
      <BackLink fallback="/collaborate#projects" className="co-link">← Collaborate</BackLink>
      <header className="co-ws-head">
        <div className="co-ws-top">
          <Thumb photo={p.photo} sizes="90px" />
          <div style={{ minWidth: 0 }}>
            <p className="co-eyebrow">{p.kind && <span className="co-kind-tag"><Icon name={kitOf(p.kind).icon} size={12} />{kitOf(p.kind).label}</span>}{p.callId ? `From an open call · ${co.call(p.callId)?.org ?? ""}` : "Project"}</p>
            <h1>{p.title}</h1>
            <p>{p.summary}</p>
          </div>
          <div className="co-ws-acts">
            <Link href={`/messages/${p.convoId}`} className="kh-btn outline"><Icon name="message" size={16} />Team chat</Link>
            <button className="kh-btn outline" onClick={() => router.push(co.project.startRoom(p))}><Icon name="live" size={16} />Meet live</button>
            <button className="kh-btn amber" onClick={() => go("work")}><Icon name="project" size={16} />Work</button>
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
        {TABS.map((t) => <button key={t.id} className={tab === t.id ? "on" : undefined} onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined}><Icon name={t.icon} size={16} />{t.label}{t.id === "agree" && unsigned && p.stage >= 2 && <span className="co-new-dot" aria-label="Needs signing" />}{t.id === "work" && reviews > 0 && <span className="co-count" aria-label={`${reviews} to review`}>{reviews}</span>}</button>)}
      </nav>

      {tab === "home" && <Overview p={p} go={go} open={openDeliverable} />}
      {tab === "agree" && <AgreeTab p={p} />}
      {tab === "work" && <WorkTab key={openD ?? "board"} p={p} openId={openD} idea={p.stage === 1 ? <StudioTab p={p} /> : undefined} />}
      {tab === "chat" && <ChatTab p={p} />}
      {tab === "room" && <RoomTab p={p} />}
      {tab === "value" && <ValueTab p={p} />}
      {tab === "record" && <PreserveTab p={p} />}
    </div>
  );
}

function Overview({ p, go, open }: { p: Project; go: (t: WsTab) => void; open: (id: string) => void }) {
  const co = useCollab();
  const list = p.deliverables ?? [];
  const approved = list.filter((d) => d.status === "approved").length;
  const review = toReview(p);
  const mine = list.find((d) => d.owner === ME && d.status !== "approved" && d.status !== "review");
  const action: { label: string; run: () => void } =
    p.stage === 1 ? { label: "Open the idea canvas", run: () => go("work") }
    : !p.charter.signedAt ? { label: "Read and sign the charter", run: () => go("agree") }
    : review.length ? { label: `Review ${review[0].title}`, run: () => open(review[0].id) }
    : mine ? { label: `Open ${mine.title}`, run: () => open(mine.id) }
    : { label: "Open the work", run: () => go("work") };
  const thread = co.thread(p);
  const lastMsg = thread[thread.length - 1];

  return (
    <div className="co-ws-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="co-next-card">
          <p className="co-eyebrow">Next up</p>
          <h3>{nextStep(p, ME)}</h3>
          {p.stage === 1 && <p>You&apos;re at the idea stage. Add references and sketches together, then move on to agreeing the terms.</p>}
          {p.stage === 2 && !p.charter.signedAt && <p>Before anyone starts, the team agrees credit, ownership, decisions, money and how to leave. Work opens when everyone has signed.</p>}
          <div className="co-row">
            <button className="kh-btn amber" onClick={action.run}>{action.label}</button>
            {p.stage === 1 && <button className="kh-btn outline" onClick={() => { co.project.toAgree(p.id); go("agree"); }}>Ready to agree terms</button>}
          </div>
        </section>

        <ReviewQueue p={p} onOpen={open} />
        <MyDeliverables p={p} onOpen={open} />

        <div className="co-facts">
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("work")}>
            <small>{kitOf(p.kind).many}</small><span><b style={{ fontSize: 22 }}>{approved}/{list.length}</b> approved</span>
            <span className="co-progress"><i style={{ width: `${list.length ? (approved / list.length) * 100 : 0}%` }} /></span>
          </button>
          <button className="co-fact" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("chat")}>
            <small>Group chat</small><span>{lastMsg ? <>{lastMsg.from === ME ? "You" : lastMsg.from === "ai" ? "Akines" : firstName(lastMsg.from)}: {"text" in lastMsg ? lastMsg.text?.slice(0, 60) : "…"}</> : "Say hello to the team"}</span>
          </button>
        </div>

        <Checkins p={p} />

        <section className="co-card co-pad" style={{ display: "grid", gap: 14 }}>
          <div className="co-sec-head"><h2 style={{ fontSize: 17 }}>Recent activity</h2><button className="co-link" style={{ border: 0, background: "none" }} onClick={() => go("record")}>Full record →</button></div>
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
          {(p.tools ?? []).length > 0 && <div className="co-tools mini">{(p.tools ?? []).map((t) => <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className="co-tool-link"><Icon name="link" size={13} />{t.label}</a>)}</div>}
          {([["agree", "Charter: credit, ownership, money"], ["work", `Work: ${kitOf(p.kind).many.toLowerCase()}`], ["room", "Room: meet live, together"], ["value", "Share value: budget and what's released"], ["record", "Record: who delivered what"]] as [WsTab, string][]).map(([t, l]) => (
            <button key={t} className="co-link" style={{ border: 0, background: "none", padding: 0, textAlign: "left" }} onClick={() => go(t)}>{l} →</button>
          ))}
        </section>
      </aside>
    </div>
  );
}
