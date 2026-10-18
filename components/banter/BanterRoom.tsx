"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { KINCIRCLE_PREFILL } from "@/components/circles/CreateKinCircle";
import { useBanterReplies, useBanters, usePollVotes, useResonance } from "./useBanters";
import { BANTER_MOODS, MOOD_LOOK, REACTIONS, lifeLeft, softenWording, toneIssue } from "@/lib/data/banter";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";
import BackLink from "@/components/ui/BackLink";

const ME_ID = ME.id as PersonId;
const PHOTOS: PhotoKey[] = ["studioEasel", "clayBowl", "textileRolls", "beadsHung", "galleryHall", "talkMugs"];
const BOUNDARIES = ["Don't include me in this kind of Banter", "Mute this subject", "Limit mentions", "Ask the creator to clarify", "Report privately"];

function Voice({ length }: { length: string }) {
  const [on, setOn] = useState(false);
  return (
    <button className="br-voice" onClick={() => setOn(!on)} aria-label={on ? "Pause voice note" : "Play voice note"}>
      <i>{on ? "❚❚" : "▶"}</i>
      <span aria-hidden>{Array.from({ length: 22 }, (_, k) => <b key={k} className={on ? "on" : undefined} style={{ height: `${25 + ((k * 37) % 75)}%`, animationDelay: `${k * 50}ms` }} />)}</span>
      <em>{length}</em>
    </button>
  );
}

export default function BanterRoom({ id }: { id: string }) {
  const router = useRouter();
  const { all, close } = useBanters();
  const b = all.find((x) => x.id === id);
  const [added, setAdded] = useBanterReplies(id);
  const { ids: resonated, toggle } = useResonance();
  const { votes, vote } = usePollVotes();
  const [myReacts, setMyReacts] = useLocal<string[]>(`ak:banter-react:${id}`, []);
  const [insights, setInsights] = useLocal<string[]>("ak:banter-insights", []);
  const [text, setText] = useState("");
  const [attach, setAttach] = useState(false);
  const [rec, setRec] = useState(0);
  const [ack, setAck] = useState(false);
  const [menu, setMenu] = useState(false);
  const [summary, setSummary] = useState(false);
  const [toast, setToast] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const replies = b ? [...b.replies, ...added] : [];
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [replies.length]);
  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => setRec((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [rec]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!b) {
    return (
      <div className="ap ap-calm" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ fontSize: 26 }}>This Banter has faded.</h1>
        <p style={{ color: "var(--ap-mute)" }}>Casual Banter naturally ends. Anything worth keeping was saved as an insight.</p>
        <Link href="/banter" className="ap-cta" style={{ marginTop: 16 }}>Back to Banter</Link>
      </div>
    );
  }

  const look = MOOD_LOOK[b.mood];
  const mood = BANTER_MOODS.find((m) => m.id === b.mood)!;
  const life = lifeLeft(b);
  const by = PEOPLE[b.by];
  const inside = [...new Set([b.by, ...replies.map((r) => r.by)])];
  const waiting = (b.tagged ?? []).filter((t) => !inside.includes(t));
  const iExplore = resonated.includes(b.id);
  const resonance = [...(b.resonance ?? []), ...(iExplore ? [ME_ID] : [])];
  const issue = ack ? null : toneIssue(text);
  const myVote = votes[b.id];
  const pollTotal = b.poll ? b.poll.votes.reduce((a, v) => a + v, 0) + (myVote !== undefined ? 1 : 0) : 0;

  const send = (kind: "text" | "photo" | "voice", extra: { photo?: PhotoKey; length?: string } = {}) => {
    if (kind === "text" && (!text.trim() || issue)) return;
    setAdded((cur) => [...cur, { id: newId("r"), by: ME_ID, kind, text: kind === "voice" ? undefined : text.trim() || undefined, ago: "now", ...extra }]);
    setText("");
    setAttach(false);
    setAck(false);
  };

  const toCircle = () => {
    localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ type: b.type === "collab" ? "project" : "creative", name: b.spark?.suggestion ?? b.prompt.slice(0, 40), purpose: `Grew out of a Banter: “${b.prompt}”`, invitees: [...new Set([...(b.spark?.people ?? []), ...inside])] }));
    router.push("/circles/new");
  };

  return (
    <div className="ap ap-calm br" style={{ ["--mood" as string]: look.bg, ["--mood-ink" as string]: look.ink } as React.CSSProperties}>
      <section className="br-chat" aria-label="The conversation">
        <header className="br-head">
          <BackLink fallback="/banter" className="br-back" aria-label="Back">←</BackLink>
          <div className="br-q">
            <p><span className="br-mood">{mood.label}</span> {b.audienceLabel} · {life.label}</p>
            <h1>{b.prompt}</h1>
          </div>
          <div className="br-menu">
            <button onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Your boundaries">⋯</button>
            {menu && (
              <div role="menu">
                {BOUNDARIES.map((x) => <button key={x} role="menuitem" onClick={() => { setMenu(false); setToast(x === "Report privately" ? "Reported privately. Only the safety team sees this." : `Done: ${x.toLowerCase()}. Nobody is told.`); }}>{x}</button>)}
                <Link href="/banter" role="menuitem">Leave quietly</Link>
              </div>
            )}
          </div>
        </header>
        <div className="br-life" aria-label={life.label}><i style={{ width: `${life.pct * 100}%` }} /></div>

        <div className="br-msgs" ref={scroller}>
          {/* The opening question */}
          <div className="br-open">
            <p className="br-who"><Avatar person={by} size={32} /> <b>{b.mine ? "You" : by.name}</b> started this Banter · {b.ago}</p>
            {b.tagged?.length ? (
              <p className="br-tagged">Asked by name: {b.tagged.map((t) => <span key={t}><Avatar person={PEOPLE[t]} size={20} />@{PEOPLE[t].name.split(" ")[0]}</span>)}</p>
            ) : null}
            <p className="br-open-q">{b.prompt}</p>
            {b.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- member's own upload, stored as a data URL
              <img src={b.image} alt="" className="br-open-photo br-own" />
            ) : b.photo ? <Photo name={b.photo} sizes="460px" className="br-open-photo" /> : null}
            {b.media && <p className="br-chip">{b.media.kind === "music" ? "♪" : "▶"} {b.media.label}</p>}
            {b.poll && (
              <div className="br-poll">
                {b.poll.options.map((o, k) => {
                  const n = b.poll!.votes[k] + (myVote === k ? 1 : 0);
                  const pct = pollTotal ? Math.round((n / pollTotal) * 100) : 0;
                  return (
                    <button key={o} onClick={() => vote(b.id, k)} className={myVote === k ? "on" : undefined}>
                      <i style={{ width: myVote !== undefined ? `${pct}%` : 0 }} /><span>{o}{myVote === k && " ✓"}</span>{myVote !== undefined && <em>{pct}%</em>}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="br-reacts">
              {REACTIONS.map((r) => {
                const n = (b.reactions[r] ?? 0) + (myReacts.includes(r) ? 1 : 0);
                return <button key={r} className={myReacts.includes(r) ? "on" : undefined} onClick={() => setMyReacts(myReacts.includes(r) ? myReacts.filter((x) => x !== r) : [...myReacts, r])}>{r}{n ? <em>{n}</em> : null}</button>;
              })}
              <button className={`br-explore${iExplore ? " on" : ""}`} onClick={() => toggle(b.id)}>✦ {iExplore ? "You want to explore this" : "I want to explore this"}</button>
            </div>
            <p className="br-hint">{mood.hint}</p>
          </div>

          {replies.map((r) => {
            const mine = r.by === ME_ID;
            const p = PEOPLE[r.by];
            return (
              <div key={r.id} className={`br-row${mine ? " mine" : ""}`}>
                {!mine && <Avatar person={p} size={30} />}
                <div className="br-bubble">
                  {!mine && <b>{p.name.split(" ")[0]}</b>}
                  {r.kind === "voice" && <Voice length={r.length ?? "0:30"} />}
                  {r.kind === "photo" && r.photo && <Photo name={r.photo} sizes="300px" className="br-photo" />}
                  {r.text && <p>{r.text}</p>}
                  <small>{r.ago}</small>
                </div>
              </div>
            );
          })}

          {b.spark && !b.closed && (
            <div className="br-spark">
              <span>✦</span>
              <div>
                <b>Something is taking shape here</b>
                <p>{b.spark.text}</p>
                <div><button onClick={toCircle}>Create “{b.spark.suggestion}”</button><button className="ghost" onClick={() => setToast("Okay. Akines won't suggest this again here.")}>Not now</button></div>
              </div>
            </div>
          )}
        </div>

        {b.closed ? (
          <p className="br-closed">This Banter has closed. You can still read it.</p>
        ) : (
          <div className="br-compose">
            {issue && (
              <div className="bd-warn">
                <b>{issue === "harsh" ? "This could sound personal rather than playful." : "This reads as a judgement about a whole group."}</b>
                {issue === "harsh" && <span>Try: “{softenWording(text)}”</span>}
                <div>{issue === "harsh" && <button onClick={() => setText(softenWording(text))}>Use calmer wording</button>}<button onClick={() => setAck(true)}>Send anyway</button></div>
              </div>
            )}
            {attach && <div className="br-pick">{PHOTOS.map((p) => <button key={p} onClick={() => send("photo", { photo: p })}><Photo name={p} sizes="80px" className="h-full" /></button>)}</div>}
            {rec ? (
              <div className="br-rec"><i />Recording… 0:{String(rec - 1).padStart(2, "0")}<button onClick={() => setRec(0)}>Cancel</button><button className="go" onClick={() => { const s = Math.max(rec - 1, 1); setRec(0); send("voice", { length: `0:${String(s).padStart(2, "0")}` }); }}>Send</button></div>
            ) : (
              <div className="br-bar">
                <button onClick={() => setAttach(!attach)} aria-label="Photo" className={attach ? "on" : undefined}>▣</button>
                <button onClick={() => setRec(1)} aria-label="Voice note">◉</button>
                <input value={text} onChange={(e) => { setText(e.target.value); setAck(false); }} onKeyDown={(e) => e.key === "Enter" && send("text")} placeholder={b.mood === "encourage" ? "Something kind and useful…" : "Add your voice to the conversation…"} />
                <button className="go" onClick={() => send("text")} disabled={!text.trim() || !!issue}>Send</button>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="br-side">
        <section className="hm-card">
          <h3>In this conversation</h3>
          {waiting.length > 0 && <p className="br-sub">Waiting on {waiting.map((t) => PEOPLE[t].name.split(" ")[0]).join(", ")}, who you tagged.</p>}
          <p className="br-sub">{inside.length} talking · sent to {b.reach ?? inside.length} · {resonance.length} want to explore it</p>
          <div className="br-people">
            {inside.map((pid) => (
              <span key={pid}><Avatar person={PEOPLE[pid]} size={34} /><em>{pid === ME_ID ? "You" : PEOPLE[pid].name.split(" ")[0]}</em></span>
            ))}
          </div>
        </section>

        <section className="hm-card">
          <h3>Turn it into something</h3>
          <p className="br-sub">Most Banter should simply fade. When it shouldn&apos;t:</p>
          <button className="km-go" onClick={toCircle}><span style={{ background: "#00a86b" }}>◎</span>Turn into a KinCircle<em>›</em></button>
          <Link className="km-go" href="/rooms/new"><span style={{ background: "#e5007e" }}>◉</span>Meet live in a room<em>›</em></Link>
          <Link className="km-go" href="/collaborate"><span style={{ background: "#2547d0" }}>⌘</span>Start a project<em>›</em></Link>
          <Link className="km-go" href="/messages"><span style={{ background: "#7b2ff7" }}>✉</span>Continue privately<em>›</em></Link>
          <button className="km-go" onClick={() => { setInsights(insights.includes(b.prompt) ? insights : [b.prompt, ...insights]); setToast("Insight saved. It stays after the Banter fades."); }}><span style={{ background: "#ffb000" }}>❖</span>Save this insight<em>›</em></button>
          {b.mine && !b.closed && <button className="km-go" onClick={() => { close(b.id); setToast("Banter closed."); }}><span style={{ background: "#6b6774" }}>×</span>Close the Banter<em>›</em></button>}
        </section>

        <section className="hm-card">
          <h3>Akines Companion</h3>
          <p className="br-sub">Only when you ask. It never posts or picks a winner.</p>
          {summary ? (
            <div className="km-sum">
              <p><b>So far:</b> {replies.length} replies from {inside.length} people.</p>
              <p><b>Open questions:</b> {replies.filter((r) => r.text?.trim().endsWith("?")).length || "none"}.</p>
              <p><b>Quieter voices:</b> {inside.length < 3 ? "few people yet; a direct question could help." : "most have spoken."}</p>
            </div>
          ) : (
            <button className="km-sum-btn" onClick={() => setSummary(true)}>✦ Summarise the conversation</button>
          )}
        </section>
      </aside>

      {toast && <div className="cq-toast" role="status">{toast}</div>}
    </div>
  );
}
