"use client";

import { SESSION_KEY } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import { INTENTS } from "@/lib/data/community";

type Mode = "login" | "signup";
type Step = "account" | "about" | "intent" | "arrive";

const STEPS: Record<Mode, Step[]> = {
  signup: ["account", "about", "intent", "arrive"],
  login: ["account", "intent", "arrive"],
};

const ROLES = ["Artist", "Collector", "Curator", "Art student", "Art historian", "Designer", "Art lover"];
const MEDIA = ["Painting", "Sculpture", "Photography", "Textile", "Fashion", "Ceramics", "Digital", "Performance", "Film"];


function remember(data: Record<string, unknown>) {
  try {
    const prev = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...data }));
  } catch {
    /* prototype only: the flow works without storage */
  }
}

/** Sign in / sign up. Both routes end in "What would feel meaningful today?", the Connection Intent Engine. */
export default function AuthFlow({ mode, startAt }: { mode: Mode; startAt?: string }) {
  const steps = STEPS[mode];
  const [step, setStep] = useState<Step>(STEPS[mode].includes(startAt as Step) ? (startAt as Step) : "account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [intentId, setIntentId] = useState<string | null>(null);

  const intent = INTENTS.find((i) => i.id === intentId);
  const first = name.trim().split(" ")[0] || (email.split("@")[0] ?? "");
  const idx = steps.indexOf(step);

  const errs = {
    name: mode === "signup" && name.trim().length < 2 ? "Tell us what to call you." : "",
    email: /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email address.",
    password: password.length >= 8 ? "" : mode === "signup" ? "Use at least 8 characters." : "Enter your password.",
    agree: mode === "signup" && !agree ? "Please accept the community promises to continue." : "",
  };
  const accountOk = !errs.name && !errs.email && !errs.password && !errs.agree;

  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };
  const next = () => go(steps[Math.min(idx + 1, steps.length - 1)]);
  const back = () => go(steps[Math.max(idx - 1, 0)]);

  const submitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!accountOk) return;
    remember({ name: first, email });
    next();
  };

  const finish = (skip = false) => {
    remember({ intent: skip ? null : intentId, role, city, media });
    next();
  };

  const toggle = (m: string) => setMedia((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="bg pattern-adire" aria-hidden />
        <Link href="/" className="auth-brand"><Image src="/akines_logo_transparent.png" alt="Akines" width={168} height={45} priority /></Link>
        <div className="auth-collage" aria-hidden>
          <div className="t a"><Pic name="heroStudio" sizes="30vw" position="50% 30%" priority /></div>
          <div className="t b"><Pic name="redPatterned" sizes="20vw" position="50% 15%" priority /></div>
          <div className="t c"><Pic name="kenteVest" sizes="20vw" position="50% 20%" priority /></div>
          <div className="t d"><Pic name="yellowPrint" sizes="20vw" position="50% 30%" priority /></div>
        </div>
        <div className="auth-quote">
          <div className="auth-kicker">akines.art</div>
          <h2>Where African creativity <em>finds its people.</em></h2>
          <p>Akines is where artists, collectors and curators meet through the work they make, keep and love.</p>
          <div className="auth-points">
            <div><b>◇</b>Introductions that come with a reason, not a wall of profiles.</div>
            <div><b>◎</b>Circles, studio visits and collaborations in one place.</div>
            <div><b>♡</b>Kind by design: no follower counts, and AI that never diagnoses.</div>
          </div>
          <small className="auth-copy">© 2026 Akines. Original African art.</small>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-top">
          <Link href="/" className="mbrand"><Image src="/akines_logo_transparent.png" alt="Akines" width={168} height={45} /></Link>
          {mode === "signup" ? (
            <span>Already a member? <Link href="/login">Sign in</Link></span>
          ) : (
            <span>New to Akines? <Link href="/signup">Create an account</Link></span>
          )}
        </div>

        <div className={`auth-card${step === "intent" ? " wide" : ""}`}>
          <div className="auth-steps" aria-label={`Step ${idx + 1} of ${steps.length}`}>
            {steps.map((s, i) => <i key={s} className={i <= idx ? "on" : undefined} />)}
          </div>

          {step === "account" && (
            <form onSubmit={submitAccount} noValidate>
              <div className="ac-eyebrow">{mode === "signup" ? "Join the Village" : "Welcome back"}</div>
              <h1>{mode === "signup" ? <>Take a seat. <em>Stay awhile.</em></> : <>Good to see <em>you again.</em></>}</h1>
              <p className="auth-lead">
                {mode === "signup"
                  ? "Create your Akines account. It takes a minute, and the next questions are what make the place feel like yours."
                  : "Sign in to pick up where you left off."}
              </p>

              <div className="auth-social">
                <button type="button" onClick={() => { setName((n) => n || "Amara Okafor"); setEmail((m) => m || "amara@example.com"); setPassword((p) => p || "demo-password"); }}>
                  <b style={{ color: "#ea4335" }}>G</b> Continue with Google
                </button>
                <button type="button" onClick={() => { setEmail((m) => m || "amara@example.com"); setPassword((p) => p || "demo-password"); }}>
                  <b>◆</b> Continue with Apple
                </button>
              </div>
              <div className="auth-or">or with your email</div>

              {mode === "signup" && (
                <div className="auth-field">
                  <label htmlFor="name">Your name</label>
                  <div className={`auth-input${tried && errs.name ? " bad" : ""}`}>
                    <input id="name" autoComplete="name" placeholder="How friends would say it" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  {tried && errs.name && <span className="auth-err">{errs.name}</span>}
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <div className={`auth-input${tried && errs.email ? " bad" : ""}`}>
                  <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {tried && errs.email && <span className="auth-err">{errs.email}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="password">Password {mode === "signup" && <small>At least 8 characters</small>}</label>
                <div className={`auth-input${tried && errs.password ? " bad" : ""}`}>
                  <input id="password" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
                </div>
                {tried && errs.password && <span className="auth-err">{errs.password}</span>}
              </div>

              {mode === "login" ? (
                <div className="auth-row">
                  <span />
                  <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                </div>
              ) : (
                <>
                  <label className="auth-check">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I'll come as myself, keep what's said in rooms in the room, and treat every artist's work with care. I accept the <a href="#" onClick={(e) => e.preventDefault()}>community promises</a>.</span>
                  </label>
                  {tried && errs.agree && <span className="auth-err" style={{ display: "block", margin: "-10px 0 14px" }}>{errs.agree}</span>}
                </>
              )}

              <button className="auth-cta" type="submit">{mode === "signup" ? "Create my account →" : "Sign in →"}</button>
              <p className="auth-fine">Prototype: nothing is sent anywhere. Any details will do.</p>
            </form>
          )}

          {step === "about" && (
            <div>
              <div className="ac-eyebrow">A little about you</div>
              <h1>Which chair <em>are you sitting in?</em></h1>
              <p className="auth-lead">Optional, and only used to introduce you to the right people. You can change every answer later in your Creative DNA.</p>

              <div className="auth-label">I am mostly a… <small>choose one</small></div>
              <div className="auth-pills">
                {ROLES.map((r) => <button key={r} type="button" className={`auth-pill${role === r ? " on" : ""}`} onClick={() => setRole(r)}>{r}</button>)}
              </div>

              <div className="auth-label">What do you make, collect or love? <small>pick any</small></div>
              <div className="auth-pills">
                {MEDIA.map((m) => <button key={m} type="button" className={`auth-pill${media.includes(m) ? " on" : ""}`} onClick={() => toggle(m)}>{m}</button>)}
              </div>

              <div className="auth-field" style={{ marginTop: 20 }}>
                <label htmlFor="city">Where are you based? <small>city only</small></label>
                <div className="auth-input">
                  <input id="city" placeholder="Lagos, Nairobi, London…" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <div className="auth-actions">
                <button className="auth-ghost" onClick={back}>← Back</button>
                <button className="auth-cta" onClick={next}>Continue →</button>
              </div>
              <div className="auth-actions" style={{ marginTop: 0, justifyContent: "center" }}>
                <button className="auth-ghost" onClick={next}>Skip this for now</button>
              </div>
            </div>
          )}

          {step === "intent" && (
            <div>
              <div className="ac-eyebrow">One last question</div>
              <h1>What would feel <em>meaningful today?</em></h1>
              <p className="auth-lead">
                {mode === "login" ? `Welcome back${first ? `, ${first}` : ""}. ` : ""}Tell us your reason for being here and the courtyard rearranges itself. It shapes suggestions only, is never shown on your profile, and you can change it anytime.
              </p>

              <div className="intent-tiles" role="radiogroup" aria-label="What would feel meaningful today?">
                {INTENTS.map((i) => (
                  <button key={i.id} type="button" role="radio" aria-checked={intentId === i.id} className={`intent-tile${intentId === i.id ? " on" : ""}`} onClick={() => setIntentId(i.id)}>
                    <Pic name={i.photo} sizes="(max-width: 900px) 50vw, 260px" />
                    <em className="tick" aria-hidden style={{ fontStyle: "normal" }}>✓</em>
                    <span>{i.label}</span>
                  </button>
                ))}
              </div>

              {intent && (
                <div className="intent-reply" key={intent.id}>
                  <h3>{intent.headline}</h3>
                  <p>{intent.body}</p>
                </div>
              )}

              <div className="auth-actions">
                {mode === "signup" && <button className="auth-ghost" onClick={back}>← Back</button>}
                <button className="auth-cta" disabled={!intent} onClick={() => finish()}>{intent ? "Continue with this reason →" : "Choose a reason to continue"}</button>
              </div>
              <div className="auth-actions" style={{ marginTop: 0, justifyContent: "center" }}>
                <button className="auth-ghost" onClick={() => finish(true)}>{mode === "login" ? "Just take me in" : "I'll decide later"}</button>
              </div>
            </div>
          )}

          {step === "arrive" && (
            <div>
              <div className="ac-eyebrow">{mode === "signup" ? "You're in" : "Signed in"}</div>
              <h1>{mode === "signup" ? "Welcome to the Village" : "Welcome back"}{first ? <>, <em>{first}.</em></> : "."}</h1>
              <p className="auth-lead">
                {mode === "signup" ? "Your account is ready. Here is where we'd start, based on what you told us." : "Here is where we'd pick things up, based on what you told us."}
              </p>

              <div className="arrive">
                <Pic name={intent?.photo ?? "circleInner"} sizes="(max-width: 900px) 100vw, 640px" />
                <div>
                  <span className="ac-eyebrow">{intent ? "Your first step" : "Start anywhere"}</span>
                  <h3>{intent ? intent.headline : "Wander in. The doors are all open."}</h3>
                  <p>{intent ? intent.body : "No reason needed. You can tell us what would feel meaningful whenever you like, from Begin something."}</p>
                </div>
              </div>

              <div className="arrive-links">
                <Link className="a" href={intent?.cta.href ?? "/"}>{intent ? `${intent.cta.label} →` : "Enter the Village →"}</Link>
                <Link className="b" href="/">{intent ? "Go to community home" : "See what's live"}</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
