"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import { CollabCard } from "@/components/home/cards";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { FIELDS, type Field } from "@/lib/collab/types";
import { callFit } from "@/lib/collab/proof";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { useWorkProfile } from "@/lib/workprofile";
import { COLLABS } from "@/lib/data/community";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { CallCard, DemoNote, ProjectCard, firstName } from "./parts";

/** People the member could make something with: similarity and productive difference (S4), each explained. */
const SUGGESTED: { who: PersonId; title: string; why: string; idea: string; mine: string; theirs: string }[] = [
  { who: "wanjiru", title: "New in Abuja, a photo zine", why: "You design stories people can hold; Wanjiru photographs people who've just arrived somewhere. Neither of you has made a printed piece about Abuja yet.", idea: "A 16-page zine of people who moved to Abuja in the last year: one portrait, one sentence each.", mine: "Designer", theirs: "Photographer" },
  { who: "kwame", title: "A queue screen for small clinics", why: "Your clinic check-in redesign and Kwame's work on offline apps meet in the same problem: patients waiting outside from 6am.", idea: "A simple screen any clinic can put on a TV, showing the queue and the next three names.", mine: "Product designer", theirs: "Developer" },
  { who: "fatou", title: "Menus that tell the cook's story", why: "Fatou cooks food with a story behind every dish; you design menus and signage. Together: a menu people keep.", idea: "Design a menu for Fatou's stall where every dish has one line about where it comes from.", mine: "Designer", theirs: "Chef" },
];

const HERO_WORDS = ["Build an app", "Paint a mural", "Teach a course", "Shoot a film", "Host an event", "Start a business"];

/** The headline's changing phrase: the next one rises out of a soft blur as the last one lifts away. */
function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => { setPrev(n); return (n + 1) % words.length; }), 2800);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className="co-rotator">
      <span className="sr-only">{words.join(", ")}</span>
      {prev !== null && <span key={`o${prev}-${i}`} className="word out" aria-hidden>{words[prev]}</span>}
      <span key={`i${i}`} className="word in" aria-hidden>{words[i]}</span>
    </span>
  );
}

/** A row that scrolls sideways, with arrows on wider screens and edge fades that show there's more. */
function Rail({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, count]);
  const step = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className={`co-rail${edge.start ? " at-start" : ""}${edge.end ? " at-end" : ""}`}>
      <div className="co-rail-arrows">
        <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label={`Scroll ${label} back`}><Icon name="more" size={18} /></button>
        <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label={`Scroll ${label} forward`}><Icon name="more" size={18} /></button>
      </div>
      <div ref={ref} className="co-rail-track" onScroll={measure} role="region" aria-label={`${label}, ${count}, scrolls sideways`} tabIndex={0}>{children}</div>
    </div>
  );
}

export default function Hub() {
  const co = useCollab({ engine: true });
  const [field, setField] = useState<Field | "All">("All");
  const [q, setQ] = useState("");
  const [proposing, setProposing] = useState<(typeof SUGGESTED)[number] | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const { wp } = useWorkProfile();
  const me = useMemo(() => ({ field: wp.field || "Design", skills: wp.skills.length ? wp.skills : ["Product design", "User research"], role: PEOPLE[ME].role }), [wp.field, wp.skills]);
  const fits = useMemo(() => new Map(co.calls.map((c) => [c.id, callFit(c, me)])), [co.calls, me]);
  const forYou = useMemo(() => co.calls.filter((c) => !c.postedByMe && (fits.get(c.id)?.score ?? 0) > 0).sort((a, b) => fits.get(b.id)!.score - fits.get(a.id)!.score), [co.calls, fits]);
  const [scope, setScope] = useState<"you" | "all">("you");
  const calls = useMemo(() => (scope === "you" ? forYou : co.calls.filter((c) => !c.postedByMe))
    .filter((c) => scope === "you" || field === "All" || c.fields.includes(field))
    .filter((c) => !q.trim() || `${c.title} ${c.org} ${c.roles.join(" ")} ${c.summary}`.toLowerCase().includes(q.trim().toLowerCase())), [co.calls, forYou, scope, field, q]);

  const activeApps = co.myApps.filter((a) => !["joined", "not-selected", "withdrawn"].includes(a.stage)).length;
  const waiting = co.apps.filter((a) => co.hostedCalls.some((c) => c.id === a.callId) && a.stage === "submitted").length;
  const proposed = new Set(co.proposals.map((p) => p.to));

  return (
    <div className="kh co">
      <section className="co-hero">
        <div className="co-hero-main">
          <div className="co-hero-copy">
            <p className="co-eyebrow">Collaborate</p>
            <h1><Rotator words={HERO_WORDS} /><span className="tail">together.</span></h1>
            <p className="lede">Answer an open call, or start something with someone you&apos;d like to work with. Every project gets a workspace, a group chat and a room to meet in, with fair terms agreed before anyone starts.</p>
            <div className="co-hero-acts">
              <Link href="/collaborate/new" className="kh-btn amber"><Icon name="spark" size={18} />Post an open call</Link>
              <a href="#people" className="kh-btn glass">Propose a project</a>
            </div>
          </div>
          <div className="co-stats">
            <Link href="/collaborate/applications" className="co-stat"><b>{activeApps}</b><span>Applications in progress</span></Link>
            <a href="#projects" className="co-stat"><b>{co.projects.length}</b><span>Projects you&apos;re in</span></a>
            <Link href="/collaborate/review" className="co-stat"><b>{co.hostedCalls.length}</b><span>{waiting ? `Calls you host · ${waiting} new` : "Calls you host"}</span></Link>
          </div>
        </div>
        {/* The photo on its own, with nothing over it. A short film of people working together can replace it later. */}
        <figure className="co-hero-photo"><Pic name="teamWork" sizes="(max-width: 760px) 100vw, 50vw" priority position="50% 30%" /></figure>
      </section>

      <ol className="co-how" aria-label="How collaboration works" style={{ margin: 0, padding: 0 }}>
        <li><b>Apply or propose</b><span>Answer a call with your work and a few honest lines, or invite one person to make something with you.</span></li>
        <li><b>Hear back, always</b><span>The host reviews, shortlists and talks to you. Every applicant hears back, whatever the outcome.</span></li>
        <li><b>Agree first</b><span>Roles, credit, ownership and money are written down and signed before work starts.</span></li>
        <li><b>Make it together</b><span>A shared workspace with a plan, a studio, a group chat and a live room, then present and share what it earns.</span></li>
      </ol>

      <section className="co-sec" id="projects">
        <div className="co-sec-head">
          <div><h2>Your projects</h2><p>Workspaces you&apos;re part of.</p></div>
          <Link href="/collaborate/applications" className="co-link">My applications →</Link>
        </div>
        {co.projects.length ? (
          <div className="co-projects">{co.projects.map((p) => <ProjectCard key={p.id} p={p} me={ME} />)}</div>
        ) : (
          <div className="co-empty"><h3>No projects yet</h3><p>When a host accepts you, or someone says yes to your proposal, the project&apos;s workspace appears here.</p></div>
        )}
      </section>

      <section className="co-sec" id="calls">
        <div className="co-sec-head">
          <div><h2>Open calls</h2><p>Teams and organisations looking for people, with the fee, rights and timeline up front.</p></div>
          <label className="co-search"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search calls, roles, organisations" aria-label="Search open calls" /></label>
        </div>
        <div className="co-scope" role="tablist" aria-label="Which calls">
          <button role="tab" aria-selected={scope === "you"} className={scope === "you" ? "on" : undefined} onClick={() => setScope("you")}>For you<span>{forYou.length}</span></button>
          <button role="tab" aria-selected={scope === "all"} className={scope === "all" ? "on" : undefined} onClick={() => setScope("all")}>All calls<span>{co.calls.filter((c) => !c.postedByMe).length}</span></button>
        </div>
        {scope === "you" ? (
          <p className="co-basis"><Icon name="spark" size={14} />Based on your work profile: <b>{me.field}</b>{me.skills.length > 0 && <> · {me.skills.slice(0, 3).join(", ")}</>} <Link href="/profile/work" className="co-link">Edit</Link></p>
        ) : (
          <div className="co-filters" role="group" aria-label="Filter by field">
            {(["All", ...FIELDS] as const).map((f) => <button key={f} className={field === f ? "on" : undefined} aria-pressed={field === f} onClick={() => setField(f)}>{f}</button>)}
          </div>
        )}
        {calls.length ? (
          <Rail label="Open calls" count={calls.length}>{calls.map((c) => <CallCard key={c.id} call={c} applied={co.appFor(c.id)} why={fits.get(c.id)?.reason || undefined} />)}</Rail>
        ) : scope === "you" ? (
          <div className="co-empty"><h3>Nothing matches your work yet</h3><p>Add your field and skills to your work profile, or look through every call.</p><div className="co-row" style={{ justifyContent: "center" }}><Link href="/profile/work" className="kh-btn amber sm">Update my work profile</Link><button className="kh-btn outline sm" onClick={() => setScope("all")}>See all calls</button></div></div>
        ) : (
          <div className="co-empty"><h3>No calls match</h3><p>Try another field, or post a call of your own.</p><Link href="/collaborate/new" className="kh-btn amber sm">Post an open call</Link></div>
        )}
      </section>

      <section className="co-sec" id="people">
        <div className="co-sec-head">
          <div><h2>People to make something with</h2><p>Send one person an idea. If they say yes, you get a shared project to shape it together.</p></div>
        </div>
        {sent && <DemoNote>Proposal sent to {sent}. In the demo they reply within a few seconds.</DemoNote>}
        <Rail label="People to make something with" count={SUGGESTED.length}>
          {SUGGESTED.map((s) => {
            const p = PEOPLE[s.who];
            const proposal = co.proposals.find((x) => x.to === s.who);
            const started = proposal?.status === "accepted" && proposal.projectId;
            const waiting = !started && proposed.has(s.who);
            return (
              <article key={s.who} className="co-pair">
                <header>
                  <span className="co-faces"><Avatar person={PEOPLE[ME]} size={36} /><Avatar person={p} size={36} /></span>
                  <span className="who"><b>You &amp; {firstName(s.who)}</b><small>{p.role} · {p.city}</small></span>
                </header>
                <span className={`co-pair-state ${started ? "ok" : waiting ? "wait" : ""}`}>{started ? `${firstName(s.who)} said yes · project started` : waiting ? `Sent · waiting for ${firstName(s.who)}` : "Suggested for you"}</span>
                <h3>{s.title}</h3>
                <p className="why">{s.why}</p>
                <dl>
                  <div><dt>You</dt><dd>{s.mine}</dd></div>
                  <div><dt>{firstName(s.who)}</dt><dd>{s.theirs}</dd></div>
                </dl>
                <footer>
                  {started ? <Link href={`/collaborate/projects/${proposal!.projectId}`} className="co-call-go">Open the project<Icon name="more" size={14} /></Link>
                    : waiting ? <span className="co-muted" style={{ fontSize: 13 }}>They&apos;ll get a notification and reply here.</span>
                    : <button type="button" className="co-call-go" onClick={() => setProposing(s)}>Propose this<Icon name="more" size={14} /></button>}
                </footer>
              </article>
            );
          })}
        </Rail>
      </section>

      <section className="co-sec">
        <div className="co-sec-head"><div><h2>Being made right now</h2><p>Projects other people are working on in the open.</p></div></div>
        <div className="co-grid">{COLLABS.map((c) => <CollabCard key={c.id} c={c} />)}</div>
      </section>

      {proposing && <ProposeSheet s={proposing} onClose={() => setProposing(null)} onSend={(input) => { co.propose(input); setSent(firstName(proposing.who)); setProposing(null); }} />}
    </div>
  );
}

function ProposeSheet({ s, onClose, onSend }: { s: (typeof SUGGESTED)[number]; onClose: () => void; onSend: (input: { to: PersonId; title: string; idea: string; myRole: string; theirRole: string }) => void }) {
  const [title, setTitle] = useState(s.title);
  const [idea, setIdea] = useState(s.idea);
  const [mine, setMine] = useState(s.mine);
  const [theirs, setTheirs] = useState(s.theirs);
  const who = firstName(s.who);
  return (
    <Sheet title={`Propose a project to ${who}`} sub={`${who} sees your idea and the roles. If they say yes, you get a private idea canvas, then agree the terms together.`} onClose={onClose}>
      <form className="kh co" style={{ gap: 16, paddingBottom: 0 }} onSubmit={(e) => { e.preventDefault(); onSend({ to: s.who, title: title.trim(), idea: idea.trim(), myRole: mine.trim(), theirRole: theirs.trim() }); }}>
        <div className="co-field"><label htmlFor="pr-t">Working title</label><input id="pr-t" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} /></div>
        <div className="co-field"><label htmlFor="pr-i">The idea</label><textarea id="pr-i" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={500} /></div>
        <div className="co-two-fields">
          <div className="co-field"><label htmlFor="pr-m">Your part</label><input id="pr-m" value={mine} onChange={(e) => setMine(e.target.value)} /></div>
          <div className="co-field"><label htmlFor="pr-y">{who}&apos;s part</label><input id="pr-y" value={theirs} onChange={(e) => setTheirs(e.target.value)} /></div>
        </div>
        <button className="kh-btn amber" style={{ height: 48 }} type="submit" disabled={!title.trim() || !idea.trim()}>Send the proposal</button>
      </form>
    </Sheet>
  );
}
