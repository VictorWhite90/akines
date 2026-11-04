"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp, ChevronRight, RotateCcw, X } from "lucide-react";
import { useMe } from "./MemberContext";
import "./companion.css";

/**
 * Create AI (formerly the Akines Companion): a launcher in the corner and a small chat panel. It opens on a
 * question, "How would you like to connect today?", whose answers point to real places in Akines, and it takes
 * free questions too. Replies are prototype rules until the Companion model is connected.
 */
type Go = { href: string; title: string; text: string };
type Msg = { from: "me" | "ai"; text: string; head?: string; go?: Go[] };

const CHOICES: { label: string; head: string; because: string; go: Go[] }[] = [
  { label: "I want some company.", head: "Some company, close by.", because: "Rooms you can drop into and things happening near you.", go: [
    { href: "/rooms", title: "Rooms open now", text: "Drop in, listen, or speak when you are ready." },
    { href: "/activities", title: "Things to do together", text: "Small, easy ways to meet people." },
    { href: "/circles", title: "KinCircle", text: "A small group you return to." },
  ] },
  { label: "I want to collaborate.", head: "Good ideas deserve good company.", because: "Open calls that need someone like you, or post your own.", go: [
    { href: "/collaborate", title: "Collaborate", text: "Your projects and open calls." },
    { href: "/collaborate/new", title: "Post an open call", text: "Say what you need, step by step." },
  ] },
  { label: "I want to meet someone new.", head: "Start with a reason.", because: "People whose journeys complement yours, and questions that open a conversation.", go: [
    { href: "/kindred", title: "Discover people", text: "Matches with a reason you can read." },
    { href: "/banter", title: "Banter", text: "One question, a small chat that fades or grows." },
  ] },
  { label: "I want to talk to a friend.", head: "Your people are here.", because: "Your conversations and the few people you want to hear from.", go: [
    { href: "/messages", title: "Messages", text: "Pick up where you left off." },
    { href: "/cliqs", title: "Cliqs", text: "Your people, on purpose." },
  ] },
  { label: "I want to play.", head: "Sometimes the easiest way in is a game.", because: "Games that give people a reason to laugh and talk.", go: [
    { href: "/play", title: "Play Together", text: "Live tonight, or slowly over the week." },
    { href: "/play/new", title: "Make a game", text: "Create one for your people." },
  ] },
  { label: "I need encouragement.", head: "Make room for how you are doing.", because: "A private check-in, and stories from people who have been there.", go: [
    { href: "/wellbeing", title: "Wellbeing", text: "A place to breathe out. Only you see your answers." },
    { href: "/stories", title: "Stories", text: "From members, in their own words." },
  ] },
  { label: "I want to offer help.", head: "Someone may be looking for exactly you.", because: "Calls for help and circles that welcome new people.", go: [
    { href: "/collaborate", title: "Open calls", text: "Projects looking for your skills." },
    { href: "/circles/new", title: "Start a KinCircle", text: "Gather people around a shared purpose." },
  ] },
  { label: "I want quiet company.", head: "You can be together without talking.", because: "Quiet rooms where people work side by side, and your own journal.", go: [
    { href: "/rooms", title: "Presence rooms", text: "Cameras optional, no pressure to speak." },
    { href: "/journal", title: "My journal", text: "For you, or for your people." },
  ] },
];

/** Free questions: prototype rules. In production these come from the Companion model. */
function reply(input: string): Msg {
  const q = input.toLowerCase();
  if (/(stuck|block|burn|anxious|anxiety|sad|lonely|tired|overwhelm|grief|flat|hopeless)/.test(q))
    return { from: "ai", text: "That sounds heavy, and it is a very common place to be. I can't diagnose anything, but I can help you reflect. A short breathing pause or a private check-in often loosens things. If this has been going on for a while, a licensed professional can help.", go: [{ href: "/wellbeing", title: "Wellbeing", text: "A private check-in and a breathing room." }] };
  if (/(ice|new|hello|start a conversation|talk to|meet)/.test(q))
    return { from: "ai", text: "Start with something you genuinely want to know, not small talk. Their profile says what they are working on, so ask about that, or share one thing you have in common. A Banter often feels less awkward than a long message.", go: [{ href: "/kindred", title: "Discover people", text: "See who you might like to meet." }] };
  if (/(circle|join|community|group)/.test(q))
    return { from: "ai", text: "Pick the circle that matches what you want right now: New in the City to meet people, Founders or Tech & Code for work, Parents Together or Book Club for life. You can join two and see which feels like yours.", go: [{ href: "/circles", title: "KinCircle", text: "Browse circles." }] };
  if (/(pric|cost|sell|worth|charge)/.test(q))
    return { from: "ai", text: "A fair first pass: your time at a fair hourly rate, plus materials or costs, then a check against people doing similar work locally. Start a little lower for your first three clients and ask for honest feedback. This is guidance, not financial advice.", go: [{ href: "/store", title: "My Store", text: "Set up what you sell." }] };
  if (/(event|get-together|party|meet ?up|plan|play|game)/.test(q))
    return { from: "ai", text: "Keep it small: six to ten people, one clear reason to come, and a simple first activity so nobody has to perform. A game like Two truths and a story works well for strangers.", go: [{ href: "/play", title: "Play Together", text: "Find a game for it." }] };
  if (/(project|collab|team|build)/.test(q))
    return { from: "ai", text: "Say what you are making and the one role you need most. People answer a clear, small ask far more often than a big one.", go: [{ href: "/collaborate/new", title: "Post an open call", text: "Step by step." }] };
  return { from: "ai", text: "Tell me a little more. I can help you meet the right people, find a circle, plan a get-together, price your work, or think through how you are feeling today." };
}

/** The Create AI face on its amber badge. */
export function CreateAiMark({ size = 56, still = false }: { size?: number; still?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 600 600" width={size} height={size} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`g${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0" gradientTransform="rotate(22 600 300)">
          <stop offset="0" stopColor="#F4A63A" /><stop offset="0.25" stopColor="#E3890D" /><stop offset="0.5" stopColor="#FEF6EC" /><stop offset="0.75" stopColor="#E3890D" /><stop offset="1" stopColor="#F4A63A" />
        </linearGradient>
        <clipPath id={`c${id}`}><circle cx="300" cy="300" r="300" /></clipPath>
      </defs>
      <g clipPath={`url(#c${id})`}><rect className={still ? undefined : "ak-cai-flow"} x="0" y="-300" width="1200" height="1200" fill={`url(#g${id})`} /></g>
      <g transform="translate(300 300.5) scale(0.56) translate(-300 -300.5)">
        <path d="M104.9 378.5A222.75 222.75 0 1 1 495.1 378.5" fill="none" stroke="#181818" strokeWidth="49.5" strokeLinecap="round" />
        <circle cx="225" cy="258" r="42.5" fill="#181818" />
        <circle cx="376" cy="258" r="42.5" fill="#181818" />
        <path d="M300.0 577.5L431.2 489.8A155 66 0 1 0 300.0 520.3Z" fill="#181818" />
      </g>
    </svg>
  );
}

/** Pages with their own composer at the bottom: the launcher would sit on their Send button. */
function hasComposer(p: string) {
  return p.startsWith("/messages") || p.includes("/events/") || p.includes("/check-in/") || p.startsWith("/circles/community/") || p.startsWith("/collaborate/projects/") || /^\/(circles\/(?!new$)[^/]+|rooms\/(?!new$)[^/]+|banter\/(?!classic|now|new)[^/]+|banter\/now\/[^/]+)$/.test(p);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning." : h < 17 ? "Good afternoon." : "Good evening.";
}

/**
 * Controlled when `open` and `onClose` are passed; otherwise it owns its state and shows its launcher.
 * `guest` (the public landing page): the places it suggests need an account, so they lead to Join.
 */
export default function Companion({ open: openProp, onClose, guest = false }: { open?: boolean; onClose?: () => void; guest?: boolean } = {}) {
  const pathname = usePathname();
  const { me } = useMe();
  const [own, setOwn] = useState(false);
  const open = openProp ?? own;
  const close = () => (onClose ? onClose() : setOwn(false));
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [stamp, setStamp] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the time the conversation started, on the client
    if (open && !stamp) setStamp(`Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
  }, [open, stamp]);
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }); }, [msgs, thinking]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { close(); launcher.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  // A link inside the panel leaves the page: close it behind the member.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close when the route changes
  useEffect(() => { setOwn(false); }, [pathname]);

  const respond = (m: Msg) => {
    setThinking(true);
    window.setTimeout(() => { setMsgs((x) => [...x, m]); setThinking(false); }, 650);
  };
  const choose = (c: (typeof CHOICES)[number]) => {
    if (thinking) return;
    setPicked(c.label);
    setMsgs((x) => [...x, { from: "me", text: c.label }]);
    respond({ from: "ai", head: c.head, text: c.because, go: c.go });
  };
  const send = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMsgs((x) => [...x, { from: "me", text: t }]);
    setDraft("");
    respond(reply(t));
  };
  const restart = () => { setMsgs([]); setPicked(null); setDraft(""); setStamp(`Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`); };
  const first = me?.firstName && !me.firstName.startsWith("@") ? me.firstName : null;

  return (
    <div className="ak-cai" data-open={open || undefined}>
      {open && (
        <section id={panelId} className="ak-cai-panel" role="dialog" aria-label="Create AI">
          <header className="ak-cai-head">
            <span className="mark"><CreateAiMark size={32} still /></span>
            <h2 className="title">Create AI</h2>
            <button type="button" className="ak-cai-ib" onClick={restart} aria-label="Start again"><RotateCcw size={18} strokeWidth={1.5} aria-hidden /></button>
            <button type="button" className="ak-cai-ib" onClick={() => { close(); launcher.current?.focus(); }} aria-label="Close"><X size={20} strokeWidth={1.5} aria-hidden /></button>
          </header>
          <div className="ak-cai-body" ref={body} aria-live="polite">
            <p className="stamp">{stamp}</p>
            <div className="msg">
              <p className="hello">{greeting()}{first ? ` ${first}.` : ""}</p>
              <h3 className="q">How would you like to connect today?</h3>
              <p className="lead">Choose what feels right for you.</p>
              <div className="chips" role="radiogroup" aria-label="How would you like to connect today?">
                {CHOICES.map((c) => (
                  <button key={c.label} type="button" role="radio" aria-checked={picked === c.label} className="choice" onClick={() => choose(c)}>
                    <span className="ind" aria-hidden />{c.label}
                  </button>
                ))}
              </div>
            </div>
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "me" ? "msg me" : "msg"}>
                {m.from === "me" ? <p>{m.text}</p> : (
                  <>
                    {m.head && <p className="rhead">{m.head}</p>}
                    <p className={m.head ? "because" : "text"}>{m.text}</p>
                    {m.go && (
                      <ul className="rows">
                        {m.go.map((g) => (
                          <li key={g.href + g.title}>
                            <Link href={guest ? "/signup" : g.href} className="row">
                              <span className="dot" aria-hidden />
                              <span className="txt"><span className="t">{g.title}</span><span className="s">{guest ? `${g.text} Join Akines to open it.` : g.text}</span></span>
                              <ChevronRight size={16} strokeWidth={1.5} className="chev" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
            {thinking && <div className="typing" aria-label="Create AI is writing"><span /><span /><span /></div>}
          </div>
          <form className="ak-cai-form" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <div className="field">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask Create AI anything" aria-label="Message Create AI" />
              <button type="submit" className="send" aria-label="Send" disabled={!draft.trim() || thinking}><ArrowUp size={18} strokeWidth={2} aria-hidden /></button>
            </div>
            <p className="foot">Create AI can get things wrong. Please check anything important.</p>
          </form>
        </section>
      )}
      {openProp === undefined && !hasComposer(pathname) && (
        <button ref={launcher} type="button" className="ak-cai-launcher" aria-label="Create AI" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOwn((o) => !o)}>
          <CreateAiMark />
        </button>
      )}
    </div>
  );
}
