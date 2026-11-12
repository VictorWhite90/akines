"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUp, ChevronRight, RotateCcw, X } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import Tooltip from "@/components/kin/Tooltip";
import { isSignedIn } from "@/lib/session";
import { useMe } from "./MemberContext";
import { ProjectChatView, START_PATH, useProjectChat } from "./createai/ProjectChat";
import { CollabChatView, EXPLORE_PATH, OPEN_PATH, useCollabChat } from "./createai/CollabChat";
import "./companion.css";

/**
 * Create AI, mirrored from the product design (classes in companion.css): a launcher in the corner that
 * opens a chat panel once a day by itself, a "How would you like to connect today?" survey whose answers
 * list places to go, and free questions answered by a built-in guide until the model is connected.
 * Every suggestion points to a real page in our app. "Start a project", "Explore collaborators" and "Open a project"
 * run their journeys inside the thread (createai/, the design's 16.3 to 16.5) instead of opening the page.
 */

type Go = { path: string; label: string };
type Item = { title: string; text: string; meta: string; href: string };
type Intention = { label: string; headline: string; items: Item[] };

const INTENTIONS: Intention[] = [
  { label: "I want some company.", headline: "Some company, whenever you are ready.", items: [
    { title: "Rooms open now", text: "Drop in, listen, or speak when you are ready.", meta: "Anytime", href: "/connect/rooms" },
    { title: "Banter", text: "One question and a small chat that fades or grows.", meta: "Today", href: "/community/banter" },
    { title: "Things to do together", text: "Small, easy ways to meet people nearby.", meta: "This week", href: "/connect/activities" },
  ] },
  { label: "I want to collaborate.", headline: "People and projects to build with.", items: [
    { title: "Discover projects", text: "Projects looking for someone with your skills.", meta: "Collaborate", href: "/collaborate/discover" },
    { title: "Start a project", text: "Say what you are making and who you need.", meta: "Step by step", href: "/collaborate/start" },
    { title: "Discover people", text: "People whose work complements yours.", meta: "Introductions", href: "/connect/discover/suggestions" },
  ] },
  { label: "I want to meet someone new.", headline: "Someone new, for a good reason.", items: [
    { title: "Discover people", text: "Introductions that come with a reason.", meta: "Introduction", href: "/connect/discover/suggestions" },
    { title: "KinCircle", text: "A small group you return to.", meta: "KinCircle", href: "/connect/kincircle" },
    { title: "Banter", text: "A question everyone can answer.", meta: "Today", href: "/community/banter" },
  ] },
  { label: "I want to talk to a friend.", headline: "Time with someone you know.", items: [
    { title: "Messages", text: "Pick up a conversation where you left off.", meta: "Conversation", href: "/messages" },
    { title: "KinCircle", text: "The few people you want to hear from.", meta: "Your people", href: "/connect/kincircle" },
  ] },
  { label: "I want to play.", headline: "Time to play.", items: [
    { title: "Activities", text: "Games and things to do with people who like to laugh.", meta: "Tonight", href: "/connect/activities" },
    { title: "Rooms open now", text: "Drop in and see who is around.", meta: "Anytime", href: "/connect/rooms" },
  ] },
  { label: "I need encouragement.", headline: "A little encouragement.", items: [
    { title: "Message someone I trust", text: "Send a note to someone who knows you well.", meta: "Private", href: "/messages" },
    { title: "Reflect privately", text: "Write down how things are, just for you.", meta: "Only you", href: "/wellbeing/reflect" },
    { title: "Stories and Legacy", text: "From members, in their own words.", meta: "Read", href: "/explore/stories" },
  ] },
  { label: "I want to offer help.", headline: "A way to be useful.", items: [
    { title: "Opportunities", text: "Projects that could use what you do.", meta: "Collaboration", href: "/collaborate/opportunities" },
    { title: "Start a KinCircle", text: "Gather people around a shared purpose.", meta: "KinCircle", href: "/connect/kincircle" },
  ] },
  { label: "I want quiet company.", headline: "Quiet company, close by.", items: [
    { title: "Quiet company", text: "Be in a calm room with others. No talking needed.", meta: "Anytime", href: "/wellbeing/quiet" },
    { title: "Reflect privately", text: "Write down how things are, just for you.", meta: "Only you", href: "/wellbeing/reflect" },
  ] },
];

const PLACES: Go[] = [
  { path: "/", label: "Community Home" }, { path: "/messages", label: "Messages" }, { path: "/community/banter", label: "Banter" },
  { path: "/connect", label: "Connect" }, { path: "/connect/kincircle", label: "KinCircle" }, { path: "/connect/rooms", label: "Rooms" }, { path: "/connect/activities", label: "Activities" },
  { path: "/collaborate", label: "Collaborate" }, { path: "/collaborate/start", label: "Start a project" },
  { path: "/collaborate/collaborators", label: "Explore collaborators" }, { path: "/collaborate/discover", label: "Discover projects" }, { path: "/collaborate/my-projects", label: "Open a project" },
  { path: "/connect/discover/suggestions", label: "Discover people" }, { path: "/make-sell", label: "Make and Sell" }, { path: "/make-sell/store", label: "My Store" },
  { path: "/make-sell/journal", label: "My Journal" }, { path: "/explore", label: "Explore" }, { path: "/explore/stories", label: "Stories" }, { path: "/explore/studio-visits", label: "Studio visits" },
  { path: "/care", label: "Care" }, { path: "/wellbeing/reflect", label: "Reflect privately" },
  { path: "/settings", label: "Settings" }, { path: "/help", label: "Help" }, { path: "/signup", label: "Join Akines" }, { path: "/landing", label: "About Akines" },
];
const place = (p: string) => PLACES.find((x) => x.path === p);

/** The built-in guide (the design's own rules, pointed at our pages). */
const RULES: { test: RegExp; text: string; go?: string[] }[] = [
  { test: /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i, text: "Hello. I am Create AI. I can help you find the right place in Akines, or just talk something through. What is on your mind?" },
  { test: /\b(join|sign ?up|create (an )?account|register)\b/i, text: "Joining is a short, step by step flow, and you can go back at any step. When you are ready, it starts here.", go: ["/signup"] },
  { test: /\b(sign ?in|log ?in|password)\b/i, text: "You can sign in from the top of any page. If you forgot your password, the sign-in panel can send you a reset code." },
  { test: /\b(start|begin|launch|new)\b.*\bproject\b|\bproject\b.*\b(start|begin|idea)\b/i, text: "Starting a project takes a few short questions about what you want to make and who you would like beside you. You can save it and come back.", go: ["/collaborate/start", "/collaborate/collaborators", "/collaborate/my-projects"] },
  { test: /\b(collaborat\w*|co-?found\w*|partners?|teammates?|find (a )?(maker|person|people))\b/i, text: "Collaborate is where projects and people meet. You can start your own, look for collaborators, or see open projects that could use another pair of hands.", go: ["/collaborate/collaborators", "/collaborate/discover"] },
  { test: /\b(open projects?|discover)\b/i, text: "Discover projects lists open projects you could join. Each one shows what is needed and who is already in.", go: ["/collaborate/discover"] },
  { test: /\bbanter\b/i, text: "Banter starts with one question. You can listen quietly or join in.", go: ["/community/banter"] },
  { test: /\b(kin ?circle|circle|gathering)\b/i, text: "A KinCircle is a small group around something you care about, so it stays personal.", go: ["/connect/kincircle"] },
  { test: /\b(room|quiet|calm)\b/i, text: "Rooms are open spaces to be with others. Some are for talking, and some are calm rooms where no talking is needed.", go: ["/connect/rooms"] },
  { test: /\b(activit|game|play|workshop)\b/i, text: "Activities and games are shared things to do together.", go: ["/connect/activities"] },
  { test: /\b(sell|shop|store|buy|journal)\b/i, text: "Make and Sell is where members share and sell their work, with a journal for the stories behind it.", go: ["/make-sell/store", "/make-sell/journal"] },
  { test: /\b(stor(y|ies)|studio|visit|heritage|legacy)\b/i, text: "Explore has stories from members and studio visits, a good place to wander.", go: ["/explore/stories", "/explore/studio-visits"] },
  { test: /\b(care|support|anxious|stress|sad|low|overwhelm|lonely|tired|burn(t|ed)? ?out)\b/i, text: "I am sorry it feels heavy. Reflect privately is a quiet place to write, just for you. If you feel unsafe, please contact your local emergency services or someone you trust.", go: ["/care", "/wellbeing/reflect"] },
  { test: /\b(message|chat with|dm|inbox)\b/i, text: "Messages holds your conversations. You can pick one up where you left off.", go: ["/messages"] },
  { test: /\b(help|contact|problem|issue|bug|not working)\b/i, text: "Settings covers your account. For anything else, Help has the details.", go: ["/settings", "/help"] },
  { test: /\b(what is|what's|about|who are|tell me about)\b.*\b(akines|this)\b|\bakines\b.*\b(what|about)\b/i, text: "Akines helps you find people you can genuinely know, trust and create with. Less scrolling, more belonging.", go: ["/landing"] },
  { test: /\b(thank|thanks)\b/i, text: "Any time. I am here whenever you want to talk something through." },
];
function reply(q: string): { text: string; go: Go[] } {
  for (const r of RULES) if (r.test.test(q.trim())) return { text: r.text, go: (r.go ?? []).map(place).filter((x): x is Go => !!x) };
  return { text: "I can point you to the right place in Akines. Tell me what you would like to do, for example start a project, meet someone, or find a quiet room.", go: [place("/")!] };
}

/** The Create AI face on its moving amber badge. */
export function CreateAiMark({ size = 56, still = false }: { size?: number; still?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width={size} height={size} aria-hidden focusable="false">
      <style>{".akm-flow{animation:akm-flow 4.8s linear infinite}@keyframes akm-flow{to{transform:translateX(-600px)}}@media (prefers-reduced-motion:reduce){.akm-flow{animation:none}}"}</style>
      <defs>
        <linearGradient id={`akm-g${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0" gradientTransform="rotate(22 600 300)">
          <stop offset="0" stopColor="#F4A63A" /><stop offset="0.25" stopColor="#E3890D" /><stop offset="0.5" stopColor="#FEF6EC" /><stop offset="0.75" stopColor="#E3890D" /><stop offset="1" stopColor="#F4A63A" />
        </linearGradient>
        <clipPath id={`akm-c${id}`}><circle cx="300" cy="300" r="300" /></clipPath>
      </defs>
      <g clipPath={`url(#akm-c${id})`}><rect className={still ? undefined : "akm-flow"} x="0" y="-300" width="1200" height="1200" fill={`url(#akm-g${id})`} /></g>
      <g transform="translate(300 300.5) scale(0.56) translate(-300 -300.5)">
        <path d="M104.9 378.5A222.75 222.75 0 1 1 495.1 378.5" fill="none" stroke="#181818" strokeWidth="49.5" strokeLinecap="round" />
        <circle cx="225" cy="258" r="42.5" fill="#181818" />
        <circle cx="376" cy="258" r="42.5" fill="#181818" />
        <path d="M300.0 577.5L431.2 489.8A155 66 0 1 0 300.0 520.3Z" fill="#181818" />
      </g>
    </svg>
  );
}

type Msg =
  | { id: number; role: "assistant"; kind: "survey" }
  | { id: number; role: "assistant"; kind: "result"; intention: number }
  | { id: number; role: "user" | "assistant"; kind: "text"; text: string; go?: Go[]; pending?: boolean; note?: string };

const DAY_KEY = "ak:createai-day";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const stamp = () => `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
const greeting = (name: string | null) => { const h = new Date().getHours(); const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; return name ? `${g}, ${name}.` : `${g}.`; };
/** Pages where the panel never opens by itself. */
const quietPage = (p: string) => p === "/login" || p.startsWith("/signup");
/** Pages with their own composer at the bottom: the launcher would sit on their Send button. Messages keeps it, as the design shows. */
function hasComposer(p: string) {
  return p.includes("/events/") || p.startsWith("/collaborate/projects/");
}

let seq = 0;
const nextId = () => ++seq;

/** Create AI. `guest` is for public pages: its suggestions lead to sign up. */
export default function Companion({ guest = false }: { guest?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { me } = useMe();
  const [signedIn, setSignedIn] = useState(false);
  const name = signedIn && me?.firstName && !me.firstName.startsWith("@") ? me.firstName : null;
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"open" | "closed">("closed");
  const [inApp, setInApp] = useState(false);
  const [layout, setLayout] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: nextId(), role: "assistant", kind: "survey" }]);
  const [chosen, setChosen] = useState(0);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const noted = useRef(false);
  const auto = useRef(false);
  // The journeys inside the thread: their own steps replace the conversation until the person starts again.
  const project = useProjectChat();
  const collab = useCollabChat();

  useEffect(() => {
    const read = () => setLayout(window.matchMedia("(max-width: 767px)").matches ? "mobile" : window.matchMedia("(max-width: 1279px)").matches ? "tablet" : "desktop");
    read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the session and the app frame are only known in the browser
    setInApp(!!document.querySelector(".app"));
    setSignedIn(!guest && isSignedIn());
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [pathname, guest]);

  // Presence: keep the panel mounted for its closing animation.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- presence follows `open`
      setMounted(true); setState("open"); return;
    }
    setState("closed");
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  const show = useCallback((focus: boolean) => {
    setTime(stamp());
    setOpen(true);
    if (focus && window.matchMedia("(min-width: 1280px)").matches) window.setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
  }, []);
  const hide = useCallback(() => { setOpen(false); window.setTimeout(() => launcher.current?.focus({ preventScroll: true }), 0); }, []);

  // Opens by itself once a day, a moment after the page settles.
  useEffect(() => {
    if (auto.current || quietPage(pathname)) return;
    let seen: string | null = null;
    try { seen = localStorage.getItem(DAY_KEY); } catch {}
    if (seen === today()) { auto.current = true; return; }
    const t = window.setTimeout(() => {
      if (auto.current) return;
      auto.current = true;
      try { localStorage.setItem(DAY_KEY, today()); } catch {}
      show(false);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [pathname, show]);

  // Close when the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); if (open) setOpen(false); }

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [msgs, mounted]);

  const restart = () => { noted.current = false; project.stop(); collab.stop(); setBusy(false); setChosen(0); setDraft(""); setTime(stamp()); setMsgs([{ id: nextId(), role: "assistant", kind: "survey" }]); };
  const pick = (n: number) => {
    if (busy) return;
    setChosen(n);
    setMsgs((m) => [...m, { id: nextId(), role: "user", kind: "text", text: INTENTIONS[n - 1].label }, { id: nextId(), role: "assistant", kind: "result", intention: n }]);
  };
  const goTo = (href: string) => { hide(); router.push(signedIn ? href : "/signup"); };
  const go = (g: Go) => {
    if (g.path === START_PATH) { collab.stop(); project.begin(); return; }
    if (g.path === EXPLORE_PATH || g.path === OPEN_PATH) { project.stop(); collab.begin(g.path === EXPLORE_PATH ? "explore" : "open"); return; }
    goTo(g.path);
  };
  // A free question typed inside a journey: the thread goes back to the open chat and answers it.
  const askFromProject = (text: string) => { project.stop(); send(text); };
  const askFromCollab = (text: string) => { collab.stop(); send(text); };
  const startFromCollab = () => { collab.stop(); project.begin(); };
  const send = (q: string) => {
    const t = q.trim();
    if (!t || busy) return;
    const pend = nextId();
    setDraft("");
    setBusy(true);
    setMsgs((m) => [...m, { id: nextId(), role: "user", kind: "text", text: t }, { id: pend, role: "assistant", kind: "text", text: "", pending: true }]);
    window.setTimeout(() => {
      const r = reply(t);
      // Like the design, the "built-in guide" note shows once per conversation, under the first answer.
      const note = noted.current ? undefined : "Live answers are not available here, so this is the built-in guide.";
      noted.current = true;
      setMsgs((m) => m.map((x) => (x.id === pend ? { id: pend, role: "assistant", kind: "text", text: r.text, go: r.go, note } : x)));
      setBusy(false);
    }, 650);
  };

  if (hasComposer(pathname) && !open) return null;

  return (
    <div className="cai" data-open={open || undefined} data-layout={layout} data-app={inApp || undefined}>
      {mounted ? (
        <section id={panelId} className="cai-panel" data-state={state} data-flow={project.active || undefined} role="dialog" aria-modal="false" aria-label="Create AI" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); hide(); } }}>
          <header className="cai-head">
            <span className="cai-head__mark" aria-hidden><CreateAiMark size={32} /></span>
            <h2 className="cai-head__title">Create AI</h2>
            <div className="cai-head__actions">
              <IconButton label="Start again" size="sm" variant="ghost" onClick={restart}><RotateCcw strokeWidth={1.5} /></IconButton>
              <IconButton label="Close" size="sm" variant="ghost" onClick={hide}><X strokeWidth={1.5} /></IconButton>
            </div>
          </header>
          {project.active ? (
            <ProjectChatView chat={project} leave={goTo} onAsk={askFromProject} signedIn={signedIn} />
          ) : collab.active ? (
            <CollabChatView chat={collab} leave={goTo} onAsk={askFromCollab} onStart={startFromCollab} />
          ) : (<>
          <div className="cai-body" ref={body} aria-live="polite">
            <p className="cai-stamp">{time}</p>
            {msgs.map((m) => {
              if (m.kind === "survey") return (
                <div key={m.id} className="cai-msg cai-msg--bot">
                  <p className="cai-hello">{greeting(name)}</p>
                  <h3 className="cai-q">How would you like to connect today?</h3>
                  <p className="cai-lead" id={`${panelId}-lead`}>Choose what feels right for you.</p>
                  <div className="cai-chips" role="group" aria-labelledby={`${panelId}-lead`}>
                    {INTENTIONS.map((it, i) => <Chip key={it.label} variant="choice" selected={chosen === i + 1} disabled={busy} onClick={() => pick(i + 1)}>{it.label}</Chip>)}
                  </div>
                </div>
              );
              if (m.kind === "result") {
                const it = INTENTIONS[m.intention - 1];
                return (
                  <div key={m.id} className="cai-msg cai-msg--bot cai-result">
                    <p className="cai-label">For you today</p>
                    <h3 className="cai-result__head">{it.headline}</h3>
                    <p className="cai-result__because">Because you chose: {it.label}</p>
                    <ul className="cai-rows">
                      {it.items.map((x) => (
                        <li key={x.title}>
                          <button type="button" className="cai-row" onClick={() => goTo(x.href)}>
                            <span className="cai-row__dot" aria-hidden />
                            <span className="cai-row__txt"><span className="cai-row__title">{x.title}</span><span className="cai-row__text">{x.text}</span></span>
                            <span className="cai-row__meta">{x.meta}</span>
                            <ChevronRight className="cai-row__chev" strokeWidth={1.5} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {signedIn ? null : <p className="cai-note">Sign in to open these.</p>}
                    <Button variant="link" size="sm" onClick={() => goTo("/")}>Show everything</Button>
                  </div>
                );
              }
              if (m.role === "user") return <div key={m.id} className="cai-msg cai-msg--me"><p>{m.text}</p></div>;
              return (
                <div key={m.id} className="cai-msg cai-msg--bot">
                  {m.pending && !m.text ? <p className="cai-typing" role="status" aria-label="Create AI is thinking"><span /><span /><span /></p> : <p className="cai-text">{m.text}</p>}
                  {m.go && m.go.length ? <div className="cai-go">{m.go.map((g) => <Button key={g.path} size="sm" variant="secondary" arrow="up-right" onClick={() => go(g)}>{g.label}</Button>)}</div> : null}
                  {m.note ? <p className="cai-note">{m.note}</p> : null}
                </div>
              );
            })}
          </div>
          <form className="cai-form" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <label className="cai-field">
              <span className="sr-only">Message Create AI</span>
              <input ref={input} className="cai-input" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask Create AI anything" autoComplete="off" enterKeyHint="send" maxLength={600} />
              <IconButton label="Send" size="sm" variant="primary" type="submit" disabled={!draft.trim() || busy}><ArrowUp strokeWidth={1.6} /></IconButton>
            </label>
            <p className="cai-foot">Create AI can get things wrong. Please check anything important.</p>
          </form>
          </>)}
        </section>
      ) : null}
      <Tooltip label="Create AI" side="top" describe={false}>
        <button ref={launcher} type="button" className="cai-launcher" aria-label="Create AI" aria-expanded={open} aria-controls={mounted ? panelId : undefined} onClick={() => (open ? hide() : show(true))}>
          <CreateAiMark size={56} />
        </button>
      </Tooltip>
    </div>
  );
}
