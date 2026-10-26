"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Sheet from "@/components/circles/community/Sheet";
import Pic from "@/components/home/Pic";
import { useMyRooms } from "@/components/rooms/MyRooms";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import type { Charter, Project, StudioItem, Task } from "@/lib/collab/types";
import { ME, useCollab } from "@/lib/collab/useCollab";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { shrinkImage } from "@/lib/imageShrink";
import { DemoNote, ago, firstName, naira } from "./parts";
import type { WsTab } from "./Workspace";

const COLORS = ["#2547d0", "#f4a63a", "#1b9e55", "#e5007e", "#7b2ff7", "#0f8b8d"];
const TERMS: { key: keyof Omit<Charter, "split" | "signed" | "signedAt">; label: string; hint: string }[] = [
  { key: "credit", label: "Credit", hint: "How everyone is named" },
  { key: "ownership", label: "Ownership", hint: "What each person keeps" },
  { key: "decisions", label: "Decisions", hint: "Who decides what" },
  { key: "expenses", label: "Expenses", hint: "How costs are paid" },
  { key: "uses", label: "Uses", hint: "Where it can be shown or sold" },
  { key: "exit", label: "Leaving", hint: "If someone has to step away" },
];
const nameOf = (id: PersonId) => (id === ME ? "You" : firstName(id));

/** A photo a teammate uploaded (kept with the project in the browser). */
function Uploaded({ src }: { src?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- a data URL from the member's own upload
  return <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
}

/* ── Agree: the charter (S5) ───────────────────────────────────── */
export function AgreeTab({ p }: { p: Project }) {
  const co = useCollab();
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  // Unsaved changes to the split, if any (otherwise the saved split).
  const [draft, setSplit] = useState<Charter["split"] | null>(null);
  const split = draft ?? p.charter.split;
  const total = p.members.reduce((n, m) => n + (split[m.id] ?? 0), 0);
  const splitChanged = p.members.some((m) => (split[m.id] ?? 0) !== (p.charter.split[m.id] ?? 0));
  const signedAll = !!p.charter.signedAt;
  const iSigned = p.charter.signed.includes(ME);

  if (p.stage < 2) {
    return (
      <section className="co-next-card">
        <h3>Shape the idea first</h3>
        <p>You&apos;re still at Imagine. When you&apos;re both happy with the idea, move on and agree the terms together. Nothing is binding until everyone signs.</p>
        <button className="kh-btn amber" style={{ justifySelf: "start" }} onClick={() => co.project.toAgree(p.id)}>We&apos;re ready to agree terms</button>
      </section>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className={`co-lock${signedAll ? " open" : ""}`}>
        <Icon name={signedAll ? "verified" : "private"} size={20} />
        <span>{signedAll ? <><b>Signed by everyone</b> {p.charter.signedAt && ago(p.charter.signedAt)}. Work is open. Any change to these terms means everyone signs again.</> : <><b>Work starts when everyone signs.</b> Read each term, change anything that isn&apos;t right, then sign. {p.charter.signed.length} of {p.members.length} signed.</>}</span>
      </div>

      <section className="co-charter" aria-label="Charter">
        {TERMS.map((t) => (
          <div key={t.key} className="co-term">
            <h4>{t.label}<small>{t.hint}</small></h4>
            {editing === t.key ? (
              <div style={{ display: "grid", gap: 8 }}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label={t.label} autoFocus />
                <div className="co-row"><button className="kh-btn amber sm" onClick={() => { co.project.editCharter(p.id, t.key, text.trim()); setEditing(null); }} disabled={!text.trim()}>Save</button><button className="kh-btn outline sm" onClick={() => setEditing(null)}>Cancel</button></div>
              </div>
            ) : <p>{p.charter[t.key]}</p>}
            {editing !== t.key && <button className="edit" onClick={() => { setEditing(t.key); setText(p.charter[t.key]); }}>Edit</button>}
          </div>
        ))}
        <div className="co-term">
          <h4>Revenue split<small>Of anything the project earns, after expenses</small></h4>
          <div className="co-split">
            <div className="co-split-bar" aria-hidden>{p.members.map((m, i) => <i key={m.id} style={{ width: `${split[m.id] ?? 0}%`, background: COLORS[i % COLORS.length] }} />)}</div>
            {p.members.map((m, i) => (
              <div key={m.id} className="co-split-row">
                <Avatar person={PEOPLE[m.id]} size={28} />
                <span><b style={{ fontWeight: 600 }}>{nameOf(m.id)}</b> <span className="co-muted">· {m.role}</span></span>
                <input type="range" min={0} max={100} value={split[m.id] ?? 0} onChange={(e) => setSplit({ ...split, [m.id]: Number(e.target.value) })} aria-label={`${PEOPLE[m.id].name}'s share`} style={{ accentColor: COLORS[i % COLORS.length] }} />
                <output>{split[m.id] ?? 0}%</output>
              </div>
            ))}
            <div className="co-row" style={{ justifyContent: "space-between" }}>
              <span className={total === 100 ? "co-chip ok" : "co-chip warn"}>Total {total}%{total !== 100 && " · must be 100%"}</span>
              {splitChanged && <button className="kh-btn amber sm" disabled={total !== 100} onClick={() => { co.project.setSplit(p.id, split); setSplit(null); }}>Save the split</button>}
            </div>
          </div>
          <span />
        </div>
      </section>

      <section className="co-block">
        <h2>Signatures</h2>
        <div className="co-sigs">
          {p.members.map((m) => {
            const yes = p.charter.signed.includes(m.id);
            return (
              <div key={m.id} className={`co-sig${yes ? " yes" : ""}`}>
                <Avatar person={PEOPLE[m.id]} size={34} />
                <div><b>{nameOf(m.id)}</b><small>{yes ? "Signed" : "Not signed yet"}</small></div>
                {yes && <span className="sign" aria-hidden>{PEOPLE[m.id].name.split(" ")[0]}</span>}
              </div>
            );
          })}
        </div>
        {!iSigned && <button className="kh-btn amber" style={{ height: 48, justifySelf: "start", padding: "0 26px" }} disabled={splitChanged || total !== 100} onClick={() => co.project.sign(p.id)}><Icon name="verified" size={18} />I agree, sign the charter</button>}
        {iSigned && !signedAll && <DemoNote>You&apos;ve signed. In the demo, your teammates sign a few seconds later; then work opens.</DemoNote>}
        <p className="co-muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>This is a plain-language agreement between the team, kept with a dated record. For large or complex projects we recommend professional advice.</p>
      </section>
    </div>
  );
}

/* ── Plan: tasks and milestones (S6) ───────────────────────────── */
export function PlanTab({ p, go }: { p: Project; go: (t: WsTab) => void }) {
  const co = useCollab();
  const [title, setTitle] = useState("");
  const [who, setWho] = useState<PersonId>(ME);
  const [due, setDue] = useState("");
  const [ms, setMs] = useState("");
  const locked = !p.charter.signedAt;
  const cols: { id: Task["status"]; label: string }[] = [{ id: "todo", label: "To do" }, { id: "doing", label: "Doing" }, { id: "done", label: "Done" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {locked && <div className="co-lock"><Icon name="private" size={20} /><span><b>The plan opens once the charter is signed by everyone.</b> You can sketch it now.</span><button className="kh-btn outline sm" style={{ marginLeft: "auto" }} onClick={() => go("agree")}>Go to the charter</button></div>}
      <form className="co-card co-pad" style={{ display: "grid", gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; co.project.addTask(p.id, { title: title.trim(), who, due: due.trim() || "No date" }); setTitle(""); setDue(""); }}>
        <b style={{ fontSize: 15 }}>Add a task</b>
        <div className="co-inline-form" style={{ flexWrap: "wrap" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" aria-label="Task" style={{ minWidth: 200 }} />
          <select value={who} onChange={(e) => setWho(e.target.value as PersonId)} aria-label="Who" style={{ padding: "10px 12px", borderRadius: 10, border: ".5px solid var(--k-border-strong)", background: "var(--k-surface)", color: "var(--k-ink)" }}>
            {p.members.map((m) => <option key={m.id} value={m.id}>{nameOf(m.id)}</option>)}
          </select>
          <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Due, e.g. Fri 15 Nov" aria-label="Due" style={{ maxWidth: 170 }} />
          <button className="kh-btn amber sm" disabled={!title.trim()}>Add</button>
        </div>
      </form>

      <div className="co-board">
        {cols.map((c) => {
          const items = p.tasks.filter((t) => t.status === c.id);
          return (
            <section key={c.id} className="co-col" aria-label={c.label}>
              <header className="co-col-head">{c.label}<span>{items.length}</span></header>
              {items.map((t) => (
                <div key={t.id} className={`co-task${t.status === "done" ? " done" : ""}`}>
                  <b>{t.title}</b>
                  <div className="meta">
                    <Avatar person={PEOPLE[t.who]} size={20} /><span>{nameOf(t.who)} · {t.due}</span>
                    <span className="move">
                      {c.id !== "todo" && <button onClick={() => co.project.moveTask(p.id, t.id, c.id === "done" ? "doing" : "todo")} aria-label="Move back">←</button>}
                      {c.id !== "done" && <button onClick={() => co.project.moveTask(p.id, t.id, c.id === "todo" ? "doing" : "done")}>{c.id === "todo" ? "Start" : "Done"}</button>}
                    </span>
                  </div>
                </div>
              ))}
              {!items.length && <p className="co-muted" style={{ fontSize: 12.5, padding: 4 }}>Nothing here.</p>}
            </section>
          );
        })}
      </div>

      <section className="co-block">
        <h2>Milestones</h2>
        <ul className="co-milestones">
          {p.milestones.map((m) => (
            <li key={m.id} className={m.done ? "done" : undefined}>
              <button className="box" onClick={() => co.project.toggleMilestone(p.id, m.id)} aria-pressed={m.done} aria-label={`Mark "${m.title}" ${m.done ? "not done" : "done"}`}>{m.done ? "✓" : ""}</button>
              <span>{m.title}</span><time>{m.due}</time>
            </li>
          ))}
        </ul>
        <form className="co-inline-form" onSubmit={(e) => { e.preventDefault(); if (ms.trim()) { co.project.addMilestone(p.id, ms.trim(), "To set"); setMs(""); } }}>
          <input value={ms} onChange={(e) => setMs(e.target.value)} placeholder="Add a milestone" aria-label="Milestone" />
          <button className="kh-btn outline sm" disabled={!ms.trim()}>Add</button>
        </form>
      </section>
    </div>
  );
}

/* ── Studio: the shared work ───────────────────────────────────── */
export function StudioTab({ p }: { p: Project }) {
  const co = useCollab();
  const [filter, setFilter] = useState<"All" | StudioItem["tag"]>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [noting, setNoting] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const items = p.studio.filter((s) => filter === "All" || s.tag === filter);
  const open = p.studio.find((s) => s.id === openId) ?? null;

  const upload = async (f: File | undefined) => {
    if (!f) return;
    const small = await shrinkImage(f, 1200).catch(() => f);
    const src = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(small); });
    co.project.addStudio(p.id, { kind: "image", title: f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "New piece", tag: "Draft", src });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="co-sec-head">
        <div><h2>{p.stage === 1 ? "Idea canvas" : "Studio"}</h2><p>{p.stage === 1 ? "A private space to shape the idea together: references, sketches and notes." : "Everything the team is making: references, drafts and finals, with comments."}</p></div>
        <div className="co-row">
          <button className="kh-btn outline" onClick={() => setNoting(true)}><Icon name="edit" size={16} />Add a note</button>
          <button className="kh-btn amber" onClick={() => file.current?.click()}><Icon name="photo" size={16} />Add a photo</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>
      <div className="co-filters">{(["All", "Reference", "Draft", "Final"] as const).map((f) => <button key={f} className={filter === f ? "on" : undefined} onClick={() => setFilter(f)}>{f} · {f === "All" ? p.studio.length : p.studio.filter((s) => s.tag === f).length}</button>)}</div>
      {items.length ? (
        <div className="co-studio">
          {items.map((s) => (
            <button key={s.id} className="co-piece" onClick={() => setOpenId(s.id)}>
              {s.kind === "image" ? <span className="ph">{s.photo ? <Pic name={s.photo} sizes="320px" /> : <Uploaded src={s.src} />}</span> : <span className="note">{s.text}</span>}
              <span className="cap">
                <b>{s.title}</b>
                <span className="co-row"><Avatar person={PEOPLE[s.by]} size={18} />{nameOf(s.by)} · {ago(s.at)}<span className={`co-chip ${s.tag === "Final" ? "ok" : ""}`} style={{ marginLeft: "auto", height: 22, fontSize: 11 }}>{s.tag}</span>{s.comments.length > 0 && <span><Icon name="discuss" size={12} /> {s.comments.length}</span>}</span>
              </span>
            </button>
          ))}
        </div>
      ) : <div className="co-empty"><h3>Nothing here yet</h3><p>Add a reference, a sketch or a note. Everyone on the team can see and comment.</p></div>}

      {open && <PieceSheet p={p} item={open} onClose={() => setOpenId(null)} />}
      {noting && (
        <Sheet title="Add a note to the studio" onClose={() => setNoting(false)}>
          <form className="kh co" style={{ gap: 14, paddingBottom: 0 }} onSubmit={(e) => { e.preventDefault(); co.project.addStudio(p.id, { kind: "note", title: noteTitle.trim(), text: noteText.trim(), tag: "Reference" }); setNoting(false); setNoteTitle(""); setNoteText(""); }}>
            <div className="co-field"><label htmlFor="nt-t">Title</label><input id="nt-t" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="e.g. Caption style" /></div>
            <div className="co-field"><label htmlFor="nt-b">Note</label><textarea id="nt-b" value={noteText} onChange={(e) => setNoteText(e.target.value)} /></div>
            <button className="kh-btn amber" style={{ height: 46 }} disabled={!noteTitle.trim() || !noteText.trim()}>Add to the studio</button>
          </form>
        </Sheet>
      )}
    </div>
  );
}

function PieceSheet({ p, item, onClose }: { p: Project; item: StudioItem; onClose: () => void }) {
  const co = useCollab();
  const [c, setC] = useState("");
  return (
    <Sheet title={item.title} sub={`${nameOf(item.by)} · ${ago(item.at)}`} onClose={onClose} wide>
      <div className="kh co co-piece-big" style={{ gap: 18, paddingBottom: 0 }}>
        {item.kind === "image" ? <span className="ph">{item.photo ? <Pic name={item.photo} sizes="600px" /> : <Uploaded src={item.src} />}</span> : <p className="co-card co-pad" style={{ fontSize: 15, lineHeight: 1.7 }}>{item.text}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="co-field"><span className="l">Where it&apos;s at</span>
            <div className="co-filters">{(["Reference", "Draft", "Final"] as const).map((t) => <button key={t} className={item.tag === t ? "on" : undefined} onClick={() => co.project.tagStudio(p.id, item.id, t)}>{t}</button>)}</div>
          </div>
          <div className="co-field"><span className="l">Comments</span>
            {item.comments.length ? <ul className="co-comments">{item.comments.map((x, i) => <li key={i}><Avatar person={PEOPLE[x.by]} size={26} /><span><b>{nameOf(x.by)}</b>{x.text}</span></li>)}</ul> : <p className="co-muted" style={{ fontSize: 13 }}>No comments yet.</p>}
          </div>
          <form className="co-inline-form" onSubmit={(e) => { e.preventDefault(); if (c.trim()) { co.project.comment(p.id, item.id, c.trim()); setC(""); } }}>
            <input value={c} onChange={(e) => setC(e.target.value)} placeholder="Add a comment" aria-label="Comment" />
            <button className="kh-btn amber sm" disabled={!c.trim()}>Send</button>
          </form>
        </div>
      </div>
    </Sheet>
  );
}

/* ── Chat: the project's KinMessage conversation ──────────────── */
export function ChatTab({ p }: { p: Project }) {
  const co = useCollab();
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const thread = co.thread(p);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [thread.length]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="co-row" style={{ justifyContent: "space-between" }}>
        <p className="co-muted" style={{ fontSize: 14 }}>The team&apos;s group chat. It&apos;s also in KinMessage, under Collaborations.</p>
        <Link href={`/messages/${p.convoId}`} className="co-link">Open in KinMessage →</Link>
      </div>
      <div className="co-chat">
        <div className="co-chat-msgs" ref={box}>
          {thread.map((m) => {
            if (m.from === "ai" || !("text" in m)) return null;
            const mine = m.from === ME;
            return (
              <div key={m.id} className={`co-msg${mine ? " mine" : ""}`}>
                {!mine && <Avatar person={PEOPLE[m.from]} size={28} />}
                <div className="b">{!mine && <small>{firstName(m.from)}</small>}{m.text}<time>{m.at}</time></div>
              </div>
            );
          })}
          {!thread.length && <p className="co-muted" style={{ margin: "auto", fontSize: 14 }}>Say hello to the team.</p>}
        </div>
        <form className="co-chat-comp" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { co.project.send(p, text.trim()); setText(""); } }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${p.title}`} aria-label="Message" />
          <button className="kh-btn amber" disabled={!text.trim()}><Icon name="send" size={16} />Send</button>
        </form>
      </div>
    </div>
  );
}

/* ── Room: meet live (Presence Rooms) ──────────────────────────── */
export function RoomTab({ p }: { p: Project }) {
  const co = useCollab();
  const router = useRouter();
  const [rooms] = useMyRooms();
  const past = rooms.filter((r) => p.rooms.includes(r.id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section className="co-room-card">
        <div>
          <p className="co-eyebrow" style={{ color: "#d7c8ff" }}>Room</p>
          <h3>Meet live, as a team</h3>
          <p>A private room for {p.members.length} people: talk, share your screen or a sketch, and decide things together. Only the team can come in.</p>
          <div className="co-row" style={{ marginTop: 12 }}><Faces ids={p.members.map((m) => m.id)} size={30} /></div>
        </div>
        <button className="kh-btn amber" onClick={() => router.push(co.project.startRoom(p))}><Icon name="live" size={18} />Start a session now</button>
      </section>
      <section className="co-block">
        <h2>Sessions</h2>
        {past.length ? (
          <ul className="co-milestones">{past.map((r) => <li key={r.id}><Icon name="live" size={18} /><span>{r.title}</span><Link href={`/rooms/${r.id}`} className="co-link" style={{ marginLeft: "auto" }}>Open</Link></li>)}</ul>
        ) : <p className="co-muted" style={{ fontSize: 14 }}>No sessions yet. Start one and the team gets a notification to join.</p>}
      </section>
    </div>
  );
}

function Faces({ ids, size }: { ids: PersonId[]; size: number }) {
  return <span className="co-faces">{ids.map((id) => <Avatar key={id} person={PEOPLE[id]} size={size} />)}</span>;
}

/* ── Present ───────────────────────────────────────────────────── */
export function PresentTab({ p }: { p: Project }) {
  const co = useCollab();
  const [f, setF] = useState(p.present);
  const finals = p.studio.filter((s) => s.tag === "Final");
  const changed = f.what !== p.present.what || f.where !== p.present.where || f.when !== p.present.when;
  return (
    <div className="co-ws-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="co-panel">
          <h2>Where it will be shown</h2>
          <div className="co-field"><label htmlFor="pr-w">What</label><input id="pr-w" value={f.what} onChange={(e) => setF({ ...f, what: e.target.value })} placeholder="e.g. Unveiling at the lake walk" /></div>
          <div className="co-two-fields">
            <div className="co-field"><label htmlFor="pr-p">Where</label><input id="pr-p" value={f.where} onChange={(e) => setF({ ...f, where: e.target.value })} /></div>
            <div className="co-field"><label htmlFor="pr-d">When</label><input id="pr-d" value={f.when} onChange={(e) => setF({ ...f, when: e.target.value })} /></div>
          </div>
          {changed && <button className="kh-btn amber" style={{ justifySelf: "start" }} onClick={() => co.project.setPresent(p.id, f)}>Save</button>}
        </section>
        <section className="co-block">
          <h2>Before it goes out</h2>
          <ul className="co-milestones">
            {p.present.checklist.map((c, i) => <li key={c.label} className={c.done ? "done" : undefined}><button className="box" onClick={() => co.project.toggleCheck(p.id, i)} aria-pressed={c.done} aria-label={c.label}>{c.done ? "✓" : ""}</button><span>{c.label}</span></li>)}
          </ul>
          {p.stage === 3 && <button className="kh-btn blue" style={{ justifySelf: "start" }} onClick={() => co.project.setStage(p.id, 4)}>Mark as presented</button>}
        </section>
      </div>
      <aside className="co-card co-pad" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ font: "600 16px var(--font-manrope)" }}>Final pieces</h2>
        {finals.length ? finals.map((s) => <div key={s.id} className="co-row"><span style={{ position: "relative", width: 56, height: 44, borderRadius: 8, overflow: "hidden", background: "var(--k-muted)", flex: "none" }}>{s.photo ? <Pic name={s.photo} sizes="60px" /> : s.src ? <Uploaded src={s.src} /> : null}</span><span style={{ fontSize: 14 }}>{s.title}</span></div>) : <p className="co-muted" style={{ fontSize: 13.5 }}>Mark pieces as Final in the studio and they gather here.</p>}
      </aside>
    </div>
  );
}

/* ── Share value: money (S7) ───────────────────────────────────── */
export function ValueTab({ p }: { p: Project }) {
  const co = useCollab();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const spent = p.budget.expenses.reduce((n, e) => n + e.amount, 0);
  const total = p.budget.total || 0;
  const left = Math.max(0, total - spent);
  const paid = p.budget.paidOut.length > 0;
  const rows = useMemo(() => p.members.map((m) => ({ m, pct: p.charter.split[m.id] ?? 0 })), [p.members, p.charter.split]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="co-money">
        <div className="co-fact"><small>Budget</small><b>{total ? naira(total) : "Not set"}</b><span className="co-muted" style={{ fontSize: 12.5 }}>From the call fee or the team</span></div>
        <div className="co-fact"><small>Spent</small><b>{naira(spent)}</b><span className="co-muted" style={{ fontSize: 12.5 }}>{p.budget.expenses.filter((e) => e.status === "pending").length} waiting to be paid back</span></div>
        <div className="co-fact"><small>To share</small><b>{naira(left)}</b><span className="co-muted" style={{ fontSize: 12.5 }}>Split as agreed in the charter</span></div>
      </div>

      <section className="co-block">
        <h2>Who gets what</h2>
        <div className="co-card" style={{ overflowX: "auto" }}>
          <table className="co-table">
            <thead><tr><th style={{ paddingTop: 14 }}>Member</th><th style={{ paddingTop: 14 }}>Share</th><th style={{ paddingTop: 14, textAlign: "right" }}>Amount</th><th style={{ paddingTop: 14 }}>Status</th></tr></thead>
            <tbody>{rows.map(({ m, pct }) => <tr key={m.id}><td><span className="co-row"><Avatar person={PEOPLE[m.id]} size={24} />{nameOf(m.id)}</span></td><td>{pct}%</td><td className="num">{naira(Math.round((left * pct) / 100))}</td><td>{paid ? <span className="co-chip ok">Paid</span> : <span className="co-chip">Due after presenting</span>}</td></tr>)}</tbody>
          </table>
        </div>
        {!paid && p.stage >= 4 && left > 0 && <button className="kh-btn amber" style={{ justifySelf: "start" }} onClick={() => co.project.payOut(p.id)}>Pay everyone their share</button>}
        <p className="co-muted" style={{ fontSize: 12.5 }}>In the live app, payments go through Paystack into each member&apos;s account, and every payment is recorded here.</p>
      </section>

      <section className="co-block">
        <h2>Expenses</h2>
        <div className="co-card" style={{ overflowX: "auto" }}>
          <table className="co-table">
            <thead><tr><th style={{ paddingTop: 14 }}>What</th><th style={{ paddingTop: 14 }}>Paid by</th><th style={{ paddingTop: 14, textAlign: "right" }}>Amount</th><th style={{ paddingTop: 14 }} /></tr></thead>
            <tbody>
              {p.budget.expenses.map((e) => <tr key={e.id}><td>{e.label}</td><td>{nameOf(e.by)}</td><td className="num">{naira(e.amount)}</td><td>{e.status === "paid" ? <span className="co-chip ok">Paid back</span> : <button className="kh-btn outline sm" onClick={() => co.project.payExpense(p.id, e.id)}>Pay back</button>}</td></tr>)}
              {!p.budget.expenses.length && <tr><td colSpan={4} className="co-muted">No expenses yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form className="co-inline-form" onSubmit={(e) => { e.preventDefault(); const n = Number(amount.replace(/[^\d]/g, "")); if (label.trim() && n > 0) { co.project.addExpense(p.id, label.trim(), n); setLabel(""); setAmount(""); } }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What was it for?" aria-label="Expense" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₦ amount" inputMode="numeric" aria-label="Amount" style={{ maxWidth: 140 }} />
          <button className="kh-btn outline sm" disabled={!label.trim() || !amount.trim()}>Add</button>
        </form>
      </section>
    </div>
  );
}

/* ── Preserve: credits and the record (S8) ─────────────────────── */
export function PreserveTab({ p }: { p: Project }) {
  const co = useCollab();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <section className="co-cert">
        <p className="co-eyebrow">Made together on Akines</p>
        <h3>{p.title}</h3>
        <p className="co-muted" style={{ fontSize: 14 }}>{p.summary}</p>
        <div className="names">{p.members.map((m) => <div key={m.id}><Avatar person={PEOPLE[m.id]} size={48} /><b>{PEOPLE[m.id].name}</b><span className="co-muted">{m.role}</span></div>)}</div>
        <p className="co-muted" style={{ fontSize: 12.5 }}>Started {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}{p.charter.signedAt ? ` · charter signed ${new Date(p.charter.signedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : ""}</p>
        {p.stage < 6 ? <button className="kh-btn blue" style={{ justifySelf: "center" }} onClick={() => co.project.preserve(p.id)}>Preserve the project</button> : <span className="co-chip ok" style={{ justifySelf: "center" }}>Preserved · credits are permanent</span>}
      </section>
      <section className="co-block">
        <h2>The record</h2>
        <p className="co-muted" style={{ fontSize: 14 }}>Every decision, signature and delivery, dated. It stays with the project, so who made what is never in question.</p>
        <ul className="co-activity">
          {[...p.ledger].reverse().map((l, i) => (
            <li key={i}>
              {l.who === "akines" ? <span className="co-ak"><Icon name="verified" size={14} /></span> : <Avatar person={PEOPLE[l.who]} size={28} />}
              <span>{l.who === "akines" ? "" : <b>{nameOf(l.who)} </b>}{l.what}<time>{new Date(l.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
