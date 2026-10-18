"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import { KINCIRCLE_PREFILL } from "@/components/circles/CreateKinCircle";
import { softenWording, toneCheck } from "@/lib/data/banter";
import type { PhotoKey } from "@/lib/data/images";
import { CONVOS, INTENTS, KIND_COLOR, KIND_LABEL, QUICK_REPLIES, type Convo, type ConvoKind, type IntentId, type KMsg } from "@/lib/data/kinmessage";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { canGoBack } from "@/lib/navHistory";
import { newId, useLocal } from "@/lib/useLocal";

type Filter = "all" | ConvoKind;
const ME_ID = ME.id as PersonId;
const PHOTOS: PhotoKey[] = ["studioEasel", "textileHang", "clayBowl", "galleryHall", "talkMugs", "beadsHung"];
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function ConvoAvatar({ c, size = 46 }: { c: Convo; size?: number }) {
  if (c.kind === "direct") return <Avatar person={PEOPLE[c.members[0]]} size={size} />;
  return (
    <span className="km-cav" style={{ width: size, height: size, ["--k" as string]: KIND_COLOR[c.kind] } as React.CSSProperties}>
      {c.photo ? <Photo name={c.photo} sizes={`${size}px`} className="absolute inset-0 h-full" /> : null}
      <span className="km-cav-n">{c.members.length + 1}</span>
    </span>
  );
}

function Voice({ length, text, mine }: { length: string; text?: string; mine: boolean }) {
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const total = Number(length.split(":")[0]) * 60 + Number(length.split(":")[1]);
  useEffect(() => {
    if (!on) return;
    const id = setTimeout(() => {
      if (t + 1 >= total) {
        setOn(false);
        setT(0);
      } else setT(t + 1);
    }, 250);
    return () => clearTimeout(id);
  }, [on, t, total]);
  const pct = t / total;
  return (
    <div className={`km-voice${mine ? " mine" : ""}`}>
      <button onClick={() => setOn(!on)} aria-label={on ? "Pause voice note" : "Play voice note"}>{on ? "❚❚" : "▶"}</button>
      <span className="km-wave" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => <i key={i} className={i / 28 < pct ? "on" : undefined} style={{ height: `${25 + ((i * 41) % 75)}%` }} />)}
      </span>
      <small>{on ? `0:${String(Math.floor(t / 4)).padStart(2, "0")}` : length}</small>
      {text && <em>{text}</em>}
    </div>
  );
}

export default function KinMessage({ initial }: { initial?: string }) {
  const router = useRouter();
  const [extraConvos, setExtraConvos] = useLocal<Convo[]>("km:convos", []);
  const [added, setAdded] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  const [votes, setVotes] = useLocal<Record<string, number>>("km:votes", {});
  const [intents, setIntents] = useLocal<Record<string, IntentId>>("km:intents", {});
  const [pins, setPins] = useLocal<Record<string, { title: string; body: string }[]>>("km:pins", {});
  const [accepted, setAccepted] = useLocal<string[]>("km:accepted", []);
  const [ai, setAi] = useLocal<boolean>("km:ai", false);
  const [read, setRead] = useLocal<string[]>("km:read", []);

  const saved = [...extraConvos, ...CONVOS];
  // /messages/<person id> opens your chat with that person, or a fresh one if you haven't talked yet.
  const person = initial && initial in PEOPLE && initial !== ME_ID ? (initial as PersonId) : null;
  const existing = initial ? saved.find((x) => x.id === initial) ?? (person ? saved.find((x) => x.kind === "direct" && x.members[0] === person) : undefined) : undefined;
  const draft: Convo | null = person && !existing
    ? { id: person, kind: "direct", name: PEOPLE[person].name, members: [person], intent: "checkin", last: "", health: { label: "Growing", value: 10, exchanges: 0, shared: 0, reciprocity: "Just starting", lastMet: "Not yet" }, memories: [], msgs: [] }
    : null;
  const convos = draft ? [draft, ...saved] : saved;
  const [activeId, setActiveId] = useState(existing?.id ?? draft?.id ?? CONVOS[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [attach, setAttach] = useState<null | "photo" | "poll">(null);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [recording, setRecording] = useState(0);
  const [warn, setWarn] = useState(false);
  const [summary, setSummary] = useState(false);
  const [intentOpen, setIntentOpen] = useState(false);
  const [composeNew, setComposeNew] = useState(false);
  const [mobileThread, setMobileThread] = useState(!!initial);
  const [toast, setToast] = useState("");
  const [tools, setTools] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const c = convos.find((x) => x.id === activeId) ?? CONVOS[0];
  useEffect(() => {
    if (draft && (added[draft.id]?.length ?? 0) > 0) setExtraConvos([draft, ...extraConvos]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the first message lands
  }, [added]);
  const intentId = intents[c.id] ?? c.intent;
  const intent = INTENTS.find((i) => i.id === intentId)!;
  const msgs = [...c.msgs, ...(added[c.id] ?? [])];
  const memories = [...(pins[c.id] ?? []), ...c.memories];

  const term = q.trim().toLowerCase();
  const list = convos
    .filter((x) => filter === "all" || x.kind === filter)
    .filter((x) => !term || x.name.toLowerCase().includes(term) || x.members.some((m) => PEOPLE[m].name.toLowerCase().includes(term)));
  const needs = list.filter((x) => x.needsYou && !read.includes(x.id));
  const rest = list.filter((x) => !needs.includes(x));

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [activeId, msgs.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecording((r) => r + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const open = (id: string) => {
    setActiveId(id);
    setMobileThread(true);
    setSummary(false);
    setAttach(null);
    if (!read.includes(id)) setRead([...read, id]);
  };

  const push = (m: KMsg) => setAdded((cur) => ({ ...cur, [c.id]: [...(cur[c.id] ?? []), m] }));

  const send = (force = false) => {
    if (attach === "poll") {
      const opts = pollOpts.map((o) => o.trim()).filter(Boolean);
      if (!pollQ.trim() || opts.length < 2) return;
      push({ id: newId("m"), from: ME_ID, at: now(), kind: "poll", question: pollQ.trim(), options: opts, votes: opts.map(() => 0) });
      setPollQ("");
      setPollOpts(["", ""]);
      setAttach(null);
      return;
    }
    if (!text.trim()) return;
    if (!force && toneCheck(text)) {
      setWarn(true);
      return;
    }
    push({ id: newId("m"), from: ME_ID, at: now(), kind: "text", text: text.trim() });
    setText("");
    setWarn(false);
  };

  const sendPhoto = (p: PhotoKey) => {
    push({ id: newId("m"), from: ME_ID, at: now(), kind: "photo", photo: p, text: text.trim() || undefined });
    setText("");
    setAttach(null);
  };

  const stopVoice = () => {
    const secs = Math.max(recording - 1, 1);
    setRecording(0);
    push({ id: newId("m"), from: ME_ID, at: now(), kind: "voice", length: `0:${String(secs).padStart(2, "0")}` });
  };

  const invite = (kind: "meetup" | "banter" | "game") => {
    const map = {
      meetup: { title: "Let's meet in person", detail: "Saturday · 11:00 · somewhere quiet", href: undefined },
      banter: { title: "A private Banter, just us", detail: "One honest question, no audience", href: "/banter" },
      game: { title: "Play Together: Two truths and a story", detail: "Live play · 20 min", href: "/play/two-truths" },
    } as const;
    push({ id: newId("m"), from: ME_ID, at: now(), kind: "invite", invite: kind, ...map[kind] });
  };

  const pin = (m: KMsg) => {
    const body = m.kind === "text" ? m.text : m.kind === "photo" ? m.text ?? "A shared photograph" : m.kind === "voice" ? m.text ?? `Voice note · ${m.length}` : "";
    setPins((cur) => ({ ...cur, [c.id]: [{ title: `Saved ${m.at}`, body }, ...(cur[c.id] ?? [])] }));
    setToast("Saved to your shared memory. Both of you can see it.");
  };

  const toKinCircle = () => {
    localStorage.setItem(KINCIRCLE_PREFILL, JSON.stringify({ name: c.kind === "direct" ? `${PEOPLE[c.members[0]].name.split(" ")[0]} & me` : c.name, purpose: `Grew out of our conversation in KinMessage.`, invitees: c.members }));
    router.push("/circles/new");
  };

  const sparkGo = (action: "collab" | "circle") => (action === "circle" ? toKinCircle() : router.push("/collaborate"));

  const people = c.kind === "direct" ? PEOPLE[c.members[0]] : null;

  return (
    <div className={`km${mobileThread ? " show-thread" : ""}`}>
      {/* Inbox */}
      <aside className="km-inbox" aria-label="Conversations">
        <div className="km-inbox-head">
          <div>
            <h1>KinMessage</h1>
            <p>Conversations that go somewhere.</p>
          </div>
          <button className="km-new" onClick={() => setComposeNew(true)} aria-label="New message">＋</button>
        </div>
        <label className="km-search">
          <span aria-hidden>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people and conversations" />
        </label>
        <div className="km-filters" role="tablist" aria-label="Filter conversations">
          {(["all", "direct", "cliq", "circle", "project"] as Filter[]).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? "on" : undefined} onClick={() => setFilter(f)}>
              {f !== "all" && <i style={{ background: KIND_COLOR[f as ConvoKind] }} />}
              {f === "all" ? "All" : f === "direct" ? "People" : `${KIND_LABEL[f as ConvoKind]}s`}
            </button>
          ))}
        </div>

        <div className="km-list">
          {needs.length > 0 && <p className="km-group">Needs you · {needs.length}</p>}
          {needs.map((x) => <Row key={x.id} c={x} active={x.id === c.id} needs onClick={() => open(x.id)} extra={added[x.id]} />)}
          {rest.length > 0 && <p className="km-group">Everyone else</p>}
          {rest.map((x) => <Row key={x.id} c={x} active={x.id === c.id} onClick={() => open(x.id)} extra={added[x.id]} />)}
          {list.length === 0 && <p className="km-empty">No conversations match “{q}”.</p>}
        </div>
      </aside>

      {/* Thread */}
      <section className="km-thread" aria-label={c.name} style={{ ["--tint" as string]: intent.tint, ["--ic" as string]: intent.color } as React.CSSProperties}>
        <header className="km-thread-head">
          <button className="km-back" onClick={() => (initial && canGoBack() ? router.back() : setMobileThread(false))} aria-label="Back">←</button>
          <ConvoAvatar c={c} size={44} />
          <div className="km-who">
            <b>{c.name}</b>
            <small>
              <i style={{ background: KIND_COLOR[c.kind] }} />
              {c.kind === "direct" ? `${people!.role} · ${people!.city}` : `${KIND_LABEL[c.kind]} · ${c.members.length + 1} people`}
            </small>
          </div>
          <div className="km-intent">
            <button onClick={() => setIntentOpen((v) => !v)} aria-expanded={intentOpen}>
              <span>{intent.glyph}</span>{intent.label}<em>▾</em>
            </button>
            {intentOpen && (
              <div className="km-intent-menu" role="menu">
                <p>What is this conversation for, right now?</p>
                {INTENTS.map((i) => (
                  <button key={i.id} role="menuitemradio" aria-checked={i.id === intentId} onClick={() => { setIntents({ ...intents, [c.id]: i.id }); setIntentOpen(false); }}>
                    <span style={{ color: i.color }}>{i.glyph}</span>
                    <span><b>{i.label}</b><small>{i.hint}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/rooms/new" className="km-icon" aria-label="Start a voice room" title="Voice room">◉</Link>
        </header>

        <div className="km-msgs" ref={scroller}>
          <p className="km-day">Today · private to {c.kind === "direct" ? `you and ${people!.name.split(" ")[0]}` : "this group"} · end-to-end encrypted</p>
          {msgs.map((m, i) => {
            if (m.kind === "spark") {
              return (
                <div key={m.id} className="km-spark">
                  <span className="km-spark-ic">✦</span>
                  <div>
                    <b>{m.title}</b>
                    <p>{m.body}</p>
                    <div className="km-spark-acts">
                      <button onClick={() => sparkGo(m.action)}>{m.action === "collab" ? "Open Collaboration Studio" : "Start a KinCircle"}</button>
                      <button className="ghost" onClick={toKinCircle}>Make it a KinCircle</button>
                    </div>
                    <small>Suggested by Akines from the shape of the conversation, not its private content.</small>
                  </div>
                </div>
              );
            }
            const mine = m.from === ME_ID;
            const prev = msgs[i - 1];
            const showWho = !mine && c.kind !== "direct" && (!prev || prev.from !== m.from);
            const author = PEOPLE[m.from as PersonId];
            return (
              <div key={m.id} className={`km-row${mine ? " mine" : ""}`}>
                {!mine && <span className="km-ra">{(!prev || prev.from !== m.from) && <Avatar person={author} size={30} />}</span>}
                <div className={`km-bubble k-${m.kind}`}>
                  {showWho && <p className="km-author">{author.name.split(" ")[0]}</p>}
                  {m.kind === "text" && <p className="km-text">{m.text}</p>}
                  {m.kind === "voice" && <Voice length={m.length} text={m.text} mine={mine} />}
                  {m.kind === "photo" && (
                    <>
                      <Photo name={m.photo} sizes="420px" className="km-photo" />
                      {m.text && <p className="km-text">{m.text}</p>}
                    </>
                  )}
                  {m.kind === "poll" && (
                    <div className="km-poll">
                      <b>≡ {m.question}</b>
                      {m.options.map((o, oi) => {
                        const my = votes[m.id];
                        const total = m.votes.reduce((a, v) => a + v, 0) + (my !== undefined ? 1 : 0);
                        const n = m.votes[oi] + (my === oi ? 1 : 0);
                        const pct = total ? Math.round((n / total) * 100) : 0;
                        return (
                          <button key={o} onClick={() => setVotes({ ...votes, [m.id]: oi })} className={my === oi ? "on" : undefined}>
                            <i style={{ width: my !== undefined ? `${pct}%` : 0 }} />
                            <span>{o}{my === oi && " ✓"}</span>
                            {my !== undefined && <em>{n}</em>}
                          </button>
                        );
                      })}
                      <small>{votes[m.id] !== undefined ? "You voted · tap to change" : "Tap to vote"}</small>
                    </div>
                  )}
                  {m.kind === "invite" && (
                    <div className={`km-invite i-${m.invite}`}>
                      <span className="km-invite-ic">{m.invite === "meetup" ? "◷" : m.invite === "banter" ? "❝" : "☺"}</span>
                      <div>
                        <small>{m.invite === "meetup" ? "Meetup" : m.invite === "banter" ? "Banter" : "Play Together"} invitation</small>
                        <b>{m.title}</b>
                        <p>{m.detail}</p>
                        {mine ? (
                          <em>Waiting for a reply</em>
                        ) : accepted.includes(m.id) ? (
                          <em className="yes">✓ You&apos;re in{m.href && <> · <Link href={m.href}>Open</Link></>}</em>
                        ) : (
                          <div className="km-invite-acts">
                            <button onClick={() => setAccepted([...accepted, m.id])}>I&apos;m in</button>
                            <button className="ghost" onClick={() => setToast("Maybe sent. No pressure on anyone.")}>Maybe</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <span className="km-meta">
                    {m.at}{mine && " · Read"}
                    <button className="km-pin" onClick={() => pin(m)} title="Save to shared memory" aria-label="Save to shared memory">❖</button>
                  </span>
                  {m.kind === "text" && m.react && <span className="km-react">{m.react.join(" ")} {m.react.length}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="km-compose">
          <div className="km-quick">
            <span>{intent.glyph} {intent.label}:</span>
            {QUICK_REPLIES[intentId].map((r) => <button key={r} onClick={() => setText(r)}>{r}</button>)}
          </div>
          {warn && (
            <div className="km-warn">
              This could land harder than you mean. Try: “{softenWording(text)}”
              <button onClick={() => { setText(softenWording(text)); setWarn(false); }}>Use it</button>
              <button onClick={() => send(true)}>Send mine</button>
            </div>
          )}
          {attach === "photo" && (
            <div className="km-attach-photos">
              {PHOTOS.map((p) => <button key={p} onClick={() => sendPhoto(p)}><Photo name={p} sizes="90px" className="h-full" /></button>)}
            </div>
          )}
          {attach === "poll" && (
            <div className="km-attach-poll">
              <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Ask the group…" />
              {pollOpts.map((o, i) => <input key={i} value={o} onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} />)}
              {pollOpts.length < 4 && <button onClick={() => setPollOpts([...pollOpts, ""])}>＋ Option</button>}
            </div>
          )}
          {recording ? (
            <div className="km-rec">
              <span className="km-rec-dot" />Recording… 0:{String(recording - 1).padStart(2, "0")}
              <button onClick={() => setRecording(0)}>Cancel</button>
              <button className="send" onClick={stopVoice}>Send voice note</button>
            </div>
          ) : (
            <div className="km-bar">
              <button className="km-more" onClick={() => setTools((v) => !v)} aria-expanded={tools} aria-label="More: photo, voice, poll, meetup, Banter, game">{tools ? "×" : "＋"}</button>
              <div className={`km-tools${tools ? " open" : ""}`} onClick={() => setTools(false)}>
                <button onClick={() => setAttach(attach === "photo" ? null : "photo")} className={attach === "photo" ? "on" : undefined} title="Photo">▣</button>
                <button onClick={() => setRecording(1)} title="Voice note">◉</button>
                <button onClick={() => setAttach(attach === "poll" ? null : "poll")} className={attach === "poll" ? "on" : undefined} title="Poll">≡</button>
                <button onClick={() => invite("meetup")} title="Propose a meetup">◷</button>
                <button onClick={() => invite("banter")} title="Invite to a Banter">❝</button>
                <button onClick={() => invite("game")} title="Invite to play">☺</button>
              </div>
              <textarea rows={1} value={text} onChange={(e) => { setText(e.target.value); setWarn(false); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={attach === "poll" ? "Polls send with the button →" : `Write to ${c.kind === "direct" ? people!.name.split(" ")[0] : c.name}…`} />
              <button className="km-send" onClick={() => send()} disabled={attach === "poll" ? !pollQ.trim() : !text.trim()}>Send</button>
            </div>
          )}
        </div>
      </section>

      {/* Relationship */}
      <aside className="km-side" aria-label="Your relationship">
        <div className="km-hero">
          <Photo name={c.photo ?? "talkTwo"} sizes="360px" className="absolute inset-0 h-full" />
          <div className="km-hero-tx">
            <small>Your relationship</small>
            <b>{c.kind === "direct" ? `You + ${people!.name.split(" ")[0]}` : c.name}</b>
            <span className="ap-faces">{[ME_ID, ...c.members].slice(0, 6).map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={26} ring /></span>)}</span>
          </div>
        </div>

        <section className="km-card">
          <div className="km-health-top"><b>Connection health</b><span className={`h-${c.health.label.toLowerCase()}`}>{c.health.label}</span></div>
          <div className="km-health-bar"><i style={{ width: `${c.health.value}%` }} /></div>
          <div className="km-stats">
            <div><b>{c.health.exchanges}</b><small>meaningful exchanges</small></div>
            <div><b>{c.health.shared}</b><small>shared projects</small></div>
            <div><b>{c.health.reciprocity}</b><small>reciprocity</small></div>
            <div><b>{c.health.lastMet}</b><small>last met</small></div>
          </div>
          <p className="km-note">Measured in what you do together, never in how often you open the app.</p>
        </section>

        <section className="km-card">
          <b className="km-h">Continue together</b>
          <Link href="/collaborate" className="km-go"><span style={{ background: "#2547d0" }}>⌘</span>Open Collaboration Studio<em>›</em></Link>
          <button onClick={toKinCircle} className="km-go"><span style={{ background: "#00a86b" }}>◎</span>Invite to a KinCircle<em>›</em></button>
          <button onClick={() => invite("game")} className="km-go"><span style={{ background: "#ff6b1a" }}>☺</span>Play Together<em>›</em></button>
          <button onClick={() => invite("meetup")} className="km-go"><span style={{ background: "#e5007e" }}>◷</span>Plan a meetup<em>›</em></button>
        </section>

        <section className="km-card">
          <b className="km-h">Shared memory</b>
          {memories.length === 0 ? (
            <p className="km-note">Nothing saved yet. Tap ❖ on any message to keep it.</p>
          ) : (
            <ol className="km-mem">{memories.map((mm, i) => <li key={i}><b>{mm.title}</b><span>{mm.body}</span></li>)}</ol>
          )}
        </section>

        <section className="km-card">
          <div className="km-health-top">
            <b>AI support</b>
            <button className={`km-toggle${ai ? " on" : ""}`} onClick={() => { setAi(!ai); setSummary(false); }} aria-pressed={ai} aria-label="AI support"><i /></button>
          </div>
          {ai ? (
            <>
              {!summary ? (
                <button className="km-sum-btn" onClick={() => setSummary(true)}>✦ Summarise this conversation</button>
              ) : (
                <div className="km-sum">
                  <p><b>So far:</b> {msgs.length} messages. {c.kind === "direct" ? `You and ${people!.name.split(" ")[0]}` : "The group"} {intentId === "plan" ? "are close to choosing a time" : intentId === "create" ? "are deciding what to make next" : intentId === "support" ? "are working through something together" : "are keeping in touch"}.</p>
                  <p><b>Open question:</b> {msgs.find((m) => m.kind === "poll") ? "A poll is still open." : "None right now."}</p>
                  <p><b>Next step:</b> {c.health.shared ? "Update the shared project." : "Agree a first small thing to do together."}</p>
                </div>
              )}
              <p className="km-note">Runs only when you ask. Nothing is stored or shown to anyone else.</p>
            </>
          ) : (
            <p className="km-note">🔒 Off. Akines doesn&apos;t read message content. Only actions you approve are remembered.</p>
          )}
        </section>
      </aside>

      {composeNew && <NewMessage onClose={() => setComposeNew(false)} onCreate={(cv) => { setExtraConvos([cv, ...extraConvos]); setActiveId(cv.id); setComposeNew(false); setMobileThread(true); }} />}
      {toast && <div className="cq-toast" role="status">{toast}</div>}
    </div>
  );
}

function Row({ c, active, needs, onClick, extra }: { c: Convo; active: boolean; needs?: boolean; onClick: () => void; extra?: KMsg[] }) {
  const all = [...c.msgs, ...(extra ?? [])];
  const last = all[all.length - 1];
  const preview = !last ? "" : last.kind === "text" ? last.text : last.kind === "voice" ? "◉ Voice note" : last.kind === "photo" ? "▣ Photo" : last.kind === "poll" ? `≡ ${last.question}` : last.kind === "invite" ? `Invitation: ${last.title}` : `✦ ${last.title}`;
  const who = last && last.from !== "ai" ? (last.from === ME_ID ? "You: " : c.kind !== "direct" ? `${PEOPLE[last.from as PersonId].name.split(" ")[0]}: ` : "") : "";
  const intent = INTENTS.find((i) => i.id === c.intent)!;
  return (
    <button className={`km-rowc${active ? " on" : ""}${needs ? " needs" : ""}`} onClick={onClick}>
      <ConvoAvatar c={c} />
      <span className="km-rowc-tx">
        <span className="km-rowc-top"><b>{c.name}</b><small>{extra?.length ? "now" : c.last}</small></span>
        <span className="km-rowc-prev">{who}{preview}</span>
        <span className="km-rowc-tags">
          <i style={{ ["--k" as string]: KIND_COLOR[c.kind] } as React.CSSProperties}>{c.kind === "direct" ? intent.label : `${KIND_LABEL[c.kind]} · ${c.members.length + 1}`}</i>
          {needs && c.unread ? <em>{c.unread}</em> : null}
        </span>
      </span>
    </button>
  );
}

function NewMessage({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Convo) => void }) {
  const [to, setTo] = useState<PersonId[]>([]);
  const [intent, setIntent] = useState<IntentId>("checkin");
  const [first, setFirst] = useState("");
  const others = allPeople.filter((p) => p.id !== ME_ID);
  const create = () => {
    const kind: ConvoKind = to.length === 1 ? "direct" : "cliq";
    const name = to.length === 1 ? PEOPLE[to[0]].name : to.map((id) => PEOPLE[id].name.split(" ")[0]).join(", ");
    onCreate({
      id: newId("cv"),
      kind,
      name,
      members: to,
      intent,
      last: "now",
      health: { label: "Growing", value: 20, exchanges: 0, shared: 0, reciprocity: "Just starting", lastMet: "Not yet" },
      memories: [],
      msgs: [{ id: newId("m"), from: ME_ID, at: now(), kind: "text", text: first.trim() }],
    });
  };
  return (
    <div className="km-modal" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="New message">
      <div className="km-modal-card">
        <div className="km-health-top"><b style={{ fontSize: 20 }}>New message</b><button className="km-icon" onClick={onClose} aria-label="Close">×</button></div>
        <p className="km-label">To</p>
        <div className="km-pick">
          {others.map((p) => (
            <button key={p.id} className={to.includes(p.id as PersonId) ? "on" : undefined} onClick={() => setTo(to.includes(p.id as PersonId) ? to.filter((x) => x !== p.id) : [...to, p.id as PersonId])}>
              <Avatar person={p} size={24} />{p.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <p className="km-label">Why are you reaching out?</p>
        <div className="km-pick">
          {INTENTS.map((i) => <button key={i.id} className={intent === i.id ? "on" : undefined} onClick={() => setIntent(i.id)}><span style={{ color: intent === i.id ? "#fff" : i.color }}>{i.glyph}</span>{i.label}</button>)}
        </div>
        <p className="km-label">First line</p>
        <textarea rows={3} value={first} onChange={(e) => setFirst(e.target.value)} placeholder={QUICK_REPLIES[intent][0]} />
        <p className="km-note">{to.length > 1 ? "Two or more people starts a small group, like a Cliq." : "A private conversation between the two of you."}</p>
        <button className="km-send wide" disabled={!to.length || !first.trim()} onClick={create}>Start conversation</button>
      </div>
    </div>
  );
}
