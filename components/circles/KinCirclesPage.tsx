"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import KinCircleHero from "./KinCircleHero";
import { CIRCLE_TYPES, type SavedKinCircle } from "./CreateKinCircle";
import { useJoined } from "./useJoined";
import { CIRCLES } from "@/lib/data/community";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

const EMERALD = "#00a86b";
const c = { ["--c" as string]: EMERALD } as React.CSSProperties;

const JOURNEY = [
  { n: "01", title: "Gather", body: "People with a genuine reason to meet." },
  { n: "02", title: "Discover", body: "Their stories, strengths and needs." },
  { n: "03", title: "Connect", body: "Trust through small shared moments." },
  { n: "04", title: "Create", body: "Conversation becomes useful action." },
  { n: "05", title: "Reflect", body: "Inclusion, contribution, relationship health." },
  { n: "06", title: "Continue", body: "Grow the relationship, or close it well." },
];

/** The member's live KinCircle, mid-journey. */
const ACTIVE = {
  name: "Weekend Coding Club",
  stage: 3,
  week: "Week 4 of 8",
  next: "Thursday · 18:00 · Presence Room",
  prompt: "Plan one 45-minute lesson a teenager would actually enjoy.",
  people: ["wanjiru", "efua", "fatou", "nandi", "tunde"] as PersonId[],
  done: ["Agreement signed by all 6", "3 of 8 lessons planned", "Roles and safeguarding agreed"],
};

type Filter = "all" | "joined" | "open";

export default function KinCirclesPage() {
  const { has, toggle } = useJoined();
  const [saved] = useLocal<SavedKinCircle[]>("ak:kincircles", []);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const joined = CIRCLES.filter((x) => has(x.id));
  const term = q.trim().toLowerCase();
  const list = CIRCLES.filter((x) => (filter === "joined" ? has(x.id) : filter === "open" ? !has(x.id) : true)).filter((x) => !term || `${x.name} ${x.blurb}`.toLowerCase().includes(term));

  return (
    <div className="ap" style={c}>
      <div className="ap-hello">
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: EMERALD }}>KinCircle</p>
          <h1 style={{ marginTop: 4 }}>Small groups. Shared purpose.</h1>
          <p>Three to twelve people, one intention, a journey with a beginning and a choice at the end.</p>
        </div>
        <div className="ap-now">
          <a href="#mine"><i style={{ background: EMERALD }} />You&apos;re in {joined.length + saved.length + 1} circles</a>
          <a href="#browse"><i style={{ background: "#ffb000" }} />{CIRCLES.length} open to join</a>
          <Link href="/circles/new" style={{ background: "#14121a", color: "#fff", borderColor: "#14121a" }}>＋ Start a KinCircle</Link>
        </div>
      </div>

      <KinCircleHero />

      {/* Your active journey */}
      <section id="mine" className="kc-section">
        <div className="kc-head">
          <h2>Your circles</h2>
          <Link href="/circles/new" className="ap-btn">＋ New circle</Link>
        </div>
        <div className="kc-active">
          <div className="kc-active-main">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="ap-tag">{ACTIVE.week} · {JOURNEY[ACTIVE.stage].title}</span>
              <span className="ap-meta">Next: {ACTIVE.next}</span>
            </div>
            <h3>{ACTIVE.name}</h3>
            <ol className="kc-track" aria-label="Journey progress">
              {JOURNEY.map((s, i) => (
                <li key={s.n} className={i < ACTIVE.stage ? "done" : i === ACTIVE.stage ? "now" : undefined}>
                  <i>{i < ACTIVE.stage ? "✓" : s.n}</i>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
            <div className="kc-prompt">
              <span>This week</span>
              <p>{ACTIVE.prompt}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <span className="ap-faces">{ACTIVE.people.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={32} ring /></span>)}<span className="ap-meta" style={{ marginLeft: 10 }}>+ you</span></span>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/messages/markets" className="ap-btn">Open the circle</Link>
                <Link href="/rooms/coding-club" className="ap-cta" style={{ marginTop: 0, height: 36 }}>Join Thursday&apos;s room</Link>
              </div>
            </div>
          </div>
          <div className="kc-active-side">
            <Photo name="talkGroup" sizes="420px" className="h-44 rounded-[18px]" />
            <p className="ap-meta" style={{ margin: "14px 0 8px", fontWeight: 700, color: "var(--ap-ink)" }}>Kept so far</p>
            <ul>
              {ACTIVE.done.map((d) => <li key={d}><span>✓</span>{d}</li>)}
            </ul>
          </div>
        </div>

        <div className="kc-mine">
          {saved.map((s) => {
            const t = CIRCLE_TYPES.find((x) => x.id === s.type);
            return (
              <div key={s.id} className="ap-card" style={c}>
                <div className="ap-card-body">
                  <span><span className="ap-tag">{t?.glyph} {t?.label} · forming</span></span>
                  <h3>{s.name}</h3>
                  {s.purpose && <p>{s.purpose}</p>}
                  <div className="ap-foot">
                    <span className="ap-faces">{s.invitees.slice(0, 4).map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={24} ring /></span>)}</span>
                    <span className="ap-meta">{s.invitees.length} invited</span>
                  </div>
                </div>
              </div>
            );
          })}
          {joined.map((x) => (
            <Link key={x.id} href={`/circles/${x.id}`} className="ap-card" style={c}>
              <div className="ap-img" style={{ height: 110 }}><Photo name={x.photo} sizes="300px" className="absolute inset-0 h-full" /><span className="ap-tag">{x.active} active now</span></div>
              <div className="ap-card-body">
                <h3>{x.name}</h3>
                <p style={{ fontStyle: "italic" }}>“{x.starter}”</p>
                <div className="ap-foot"><span className="ap-meta">{x.members} members</span><span className="ap-btn">Open</span></div>
              </div>
            </Link>
          ))}
          <Link href="/circles/new" className="kc-new">
            <span>＋</span>
            <b>Start a KinCircle</b>
            <small>Choose a purpose, invite complementary people, agree how you&apos;ll be together.</small>
          </Link>
        </div>
      </section>

      {/* The rhythm */}
      <section className="kc-section kc-rhythm-sec">
        <div className="kc-head"><h2>Every circle follows one rhythm</h2><span className="ap-meta">A relationship with direction</span></div>
        <ol className="kc-rhythm">
          {JOURNEY.map((s) => (
            <li key={s.n}>
              <span>{s.n}</span>
              <b>{s.title}</b>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Start one */}
      <section className="kc-section kc-kinds">
        <div className="kc-head"><h2>What kind of circle?</h2><Link href="/circles/new" className="ap-meta" style={{ fontWeight: 700, color: "var(--ap-ink)" }}>Open the builder →</Link></div>
        <div className="kc-types">
          {CIRCLE_TYPES.map((t) => (
            <Link key={t.id} href="/circles/new" className="kc-type">
              <span>{t.glyph}</span>
              <b>{t.label}</b>
              <p>{t.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse */}
      <section id="browse" className="kc-section">
        <div className="kc-head">
          <h2>Find a circle</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {(["all", "open", "joined"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`ap-btn${filter === f ? " on" : ""}`}>{f === "all" ? "All" : f === "open" ? "Not joined" : "Joined"}</button>
            ))}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search circles…" aria-label="Search circles" className="kc-search" />
          </div>
        </div>
        <div className="kc-grid">
          {list.map((x) => {
            const inn = has(x.id);
            return (
              <article key={x.id} className="ap-card" style={c}>
                <Link href={`/circles/${x.id}`} className="ap-img" style={{ height: 150 }}>
                  <Photo name={x.photo} sizes="360px" className="absolute inset-0 h-full" />
                  <span className="ap-tag">{x.active} active now</span>
                </Link>
                <div className="ap-card-body">
                  <h3>{x.name}</h3>
                  <p>{x.blurb}</p>
                  <p className="kc-starter">“{x.starter}”</p>
                  <div className="ap-foot">
                    <span className="ap-meta">{x.members} members</span>
                    {inn ? <Link href={`/circles/${x.id}`} className="ap-btn on">Open chat</Link> : <button className="ap-btn" onClick={() => toggle(x.id)}>Join</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {list.length === 0 && <p className="ap-meta" style={{ marginTop: 16 }}>No circles match. <Link href="/circles/new" style={{ fontWeight: 700, color: "var(--ap-ink)" }}>Start your own</Link>.</p>}
      </section>
    </div>
  );
}
