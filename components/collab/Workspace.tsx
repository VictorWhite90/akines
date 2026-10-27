"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { JOURNEY, type Project } from "@/lib/collab/types";
import { kitOf } from "@/lib/collab/kits";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE } from "@/lib/data/people";
import { DemoNote, Thumb, firstName } from "./parts";
import Board, { Face, ReviewInbox, TeamFeed, Tools, YourWork, isOnline, toReview } from "./WorkTab";
import { AgreeTab, ChatTab, PreserveTab, RoomTab, StudioTab, ValueTab } from "./WorkspaceTabs";

export type WsTab = "home" | "work" | "agree" | "chat" | "room" | "value" | "record";
const VIEWS: { id: WsTab; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "work", label: "Board", icon: "project" },
  { id: "chat", label: "Chat", icon: "message" },
  { id: "room", label: "Meet", icon: "live" },
  { id: "agree", label: "Agreement", icon: "verified" },
  { id: "value", label: "Money", icon: "chart" },
  { id: "record", label: "Record", icon: "save" },
];
/** Older links (and bell notices) used the tab names from before the board. */
const OLD_TABS: Record<string, WsTab> = { overview: "home", plan: "work", studio: "work", present: "work", preserve: "record" };

/**
 * A collaboration's workspace (S1, S5–S8): a team space with a sidebar, like a work tool, for any kind of work
 * (lib/collab/kits). Home shows who's waiting for you and what the team is up to; the board holds what each
 * person promised, with proof, review and approval; chat, meetings, the agreement, money and the record sit
 * one click away. The work itself happens in the team's own tools, pinned in the sidebar.
 */
export default function Workspace({ id }: { id: string }) {
  const co = useCollab({ engine: true });
  const router = useRouter();
  const q = useSearchParams();
  const raw = q.get("tab") ?? "";
  const startTab = OLD_TABS[raw] ?? raw;
  const [joined] = useState(q.get("joined") === "1");
  const [tab, setTab] = useState<WsTab>(VIEWS.some((t) => t.id === startTab) ? (startTab as WsTab) : "home");
  const [openD, setOpenD] = useState<string | null>(q.get("d"));
  const p = co.projects.find((x) => x.id === id);

  // Older sample projects get their KinMessage conversation the first time the workspace opens.
  useEffect(() => {
    if (p) co.ensureConvo(p, [{ from: p.host, text: `This is our space for ${p.title}. Everything we decide lands in the workspace too.` }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per project
  }, [p?.id]);

  if (!co.ready) return <div className="kh co ws" aria-busy="true" />;
  if (!p) return <div className="kh co"><div className="co-empty"><h3>This project isn&apos;t available</h3><p>You may not be on this team yet.</p><Link href="/collaborate#projects" className="kh-btn amber sm">Your projects</Link></div></div>;

  const url = (t: WsTab, d?: string | null) => `/collaborate/projects/${p.id}?tab=${t}${d ? `&d=${d}` : ""}`;
  const go = (t: WsTab) => { setTab(t); setOpenD(null); router.replace(url(t), { scroll: false }); };
  const open = (d: string | null) => { setOpenD(d); if (d) setTab("work"); router.replace(url(d ? "work" : tab, d), { scroll: false }); };
  const reviews = toReview(p).length;
  const unsigned = !p.charter.signedAt && p.stage >= 2;
  const kit = kitOf(p.kind);
  const online = p.members.filter((m) => isOnline(m.id)).length;
  const list = p.deliverables ?? [];
  const doneN = list.filter((d) => d.status === "approved").length;

  return (
    <div className="kh co ws">
      <header className="ws-head">
        <Link href="/collaborate#projects" className="ws-back" aria-label="Back to Collaborate"><Icon name="more" size={18} /></Link>
        <Thumb photo={p.photo} className="ws-thumb" sizes="56px" />
        <div className="ws-title">
          <h1>{p.title}</h1>
          <span className="ws-sub">
            {p.kind && <span className="ws-kind"><Icon name={kit.icon} size={12} />{kit.label}</span>}
            <span className="ws-stage">{JOURNEY[p.stage]} · stage {p.stage + 1} of 7</span>
            {list.length > 0 && <span>{doneN} of {list.length} done</span>}
          </span>
        </div>
        <div className="ws-people" title={`${online} online`}>
          <span className="ws-stackfaces">{p.members.slice(0, 5).map((m) => <Face key={m.id} id={m.id} size={32} />)}</span>
          {p.members.length > 5 && <span className="ws-more">+{p.members.length - 5}</span>}
        </div>
        <div className="ws-head-acts">
          <button className="kh-btn outline sm" onClick={() => go("chat")} aria-label="Team chat"><Icon name="message" size={15} /><span className="lbl">Chat</span></button>
          <button className="kh-btn amber sm" onClick={() => router.push(co.project.startRoom(p))} aria-label="Meet now"><Icon name="live" size={15} /><span className="lbl">Meet now</span></button>
        </div>
      </header>

      {joined && <DemoNote>Welcome to the team. Sign the agreement first: once everyone has signed, the board opens for work.</DemoNote>}
      {unsigned && <button className="ws-banner" onClick={() => go("agree")}><Icon name="verified" size={16} /><span><b>Sign the agreement to start.</b> {p.charter.signed.length} of {p.members.length} have signed.</span><span className="ws-banner-go">Open →</span></button>}

      <div className="ws-frame">
        <aside className="ws-side">
          <nav aria-label="Workspace">
            {VIEWS.map((v) => (
              <button key={v.id} className={tab === v.id ? "on" : undefined} onClick={() => go(v.id)} aria-current={tab === v.id ? "page" : undefined}>
                <Icon name={v.icon} size={17} /><span>{v.label}</span>
                {v.id === "work" && reviews > 0 && <em className="ws-badge">{reviews}</em>}
                {v.id === "agree" && unsigned && <em className="ws-dot" aria-label="Needs signing" />}
              </button>
            ))}
          </nav>
          <div className="ws-side-sec">
            <h4>Pinned tools</h4>
            {(p.tools ?? []).length ? (
              <ul className="ws-side-tools">{(p.tools ?? []).map((t) => <li key={t.id}><a href={t.url} target="_blank" rel="noopener noreferrer"><Icon name="link" size={14} />{t.label}</a></li>)}</ul>
            ) : <p className="ws-faint">The repo, the design file, the shared folder.</p>}
            <button className="ws-side-link" onClick={() => go("work")}>Manage tools</button>
          </div>
          <div className="ws-side-sec">
            <h4>Team · {online} online</h4>
            <ul className="ws-side-team">
              {p.members.map((m) => (
                <li key={m.id}>
                  <Face id={m.id} size={28} />
                  <span><b>{m.id === ME ? "You" : PEOPLE[m.id].name}</b><small>{m.role}</small></span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="ws-main">
          {tab === "home" && <Home p={p} go={go} open={open} />}
          {tab === "work" && (
            <>
              <div className="ws-viewhead"><h2>{kit.many}</h2><Tools p={p} /></div>
              <Board p={p} openId={openD} onOpen={open} idea={p.stage === 1 ? <StudioTab p={p} /> : undefined} />
            </>
          )}
          {tab === "agree" && <View title="Agreement" sub="Credit, ownership, decisions, money and how to leave, agreed before anyone starts."><AgreeTab p={p} /></View>}
          {tab === "chat" && <View title="Team chat" sub="The same conversation as in KinMessage."><ChatTab p={p} /></View>}
          {tab === "room" && <View title="Meet" sub={`Live sessions for ${kit.label.toLowerCase()} work, just for the team.`}><RoomTab p={p} /></View>}
          {tab === "value" && <View title="Money" sub="The budget, what approvals have released, and who gets what."><ValueTab p={p} /></View>}
          {tab === "record" && <View title="Record" sub="Who delivered what, approved by whom, and every decision, dated."><PreserveTab p={p} /></View>}
        </main>
      </div>
    </div>
  );
}

function View({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return <div className="ws-stack"><div className="ws-viewhead"><div><h2>{title}</h2><p className="ws-faint">{sub}</p></div></div>{children}</div>;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Home({ p, go, open }: { p: Project; go: (t: WsTab) => void; open: (id: string) => void }) {
  const co = useCollab();
  const kit = kitOf(p.kind);
  const thread = co.thread(p);
  const last = thread[thread.length - 1];
  const note = p.stage === 1 ? "You're shaping the idea together. Choose the kind of work to set up the board." : !p.charter.signedAt ? "Sign the agreement with your team so the work can start." : "";

  return (
    <div className="ws-home">
      <div className="ws-hello">
        <h2>{greeting()}, {firstName(ME)}</h2>
        {note && <p>{note}</p>}
      </div>

      {p.stage === 1 && <button className="ws-cta" onClick={() => go("work")}><Icon name="project" size={18} /><span><b>Set up the board</b><small>Pick the kind of work: {kit.label} and five others</small></span><Icon name="more" size={16} /></button>}
      {p.stage >= 2 && !p.charter.signedAt && <button className="ws-cta" onClick={() => go("agree")}><Icon name="verified" size={18} /><span><b>Read and sign the agreement</b><small>{p.charter.signed.length} of {p.members.length} signed</small></span><Icon name="more" size={16} /></button>}

      {/* On phones the two columns become one list, in this order: review, your work, updates, team. */}
      <div className="ws-home-grid">
        <div className="ws-stack">
          {p.charter.signedAt && <div className="ws-o1"><ReviewInbox p={p} onOpen={open} /></div>}
          <div className="ws-o3"><TeamFeed p={p} /></div>
        </div>
        <div className="ws-stack">
          <div className="ws-o2"><YourWork p={p} onOpen={open} /></div>
          <section className="ws-box ws-o4">
            <h3 className="ws-h3">Team</h3>
            <button type="button" className="ws-lastmsg" onClick={() => go("chat")}>
              {last && last.from !== "ai" ? <Face id={last.from} size={30} /> : <span className="co-ak"><Icon name="message" size={14} /></span>}
              <span><b>{last ? (last.from === ME ? "You" : last.from === "ai" ? "Akines" : firstName(last.from)) : "No messages yet"}</b><small>{last && "text" in last ? last.text : "Say hello to the team"}</small></span>
              <Icon name="more" size={15} />
            </button>
            <div className="ws-meetchips">{kit.rituals.map((r) => <button key={r.title} type="button" onClick={() => go("room")}><Icon name="live" size={14} />{r.title}<small>{r.minutes}m</small></button>)}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
