"use client";

import { auth, type Member } from "@/lib/api/client";
import { rememberChoices, rememberMember } from "@/lib/session";
import { STRONG, STRONG_HINT } from "./LoginScreen";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import { INTENTS } from "@/lib/data/community";

type Mode = "login" | "signup";
type Step = "account" | "verify" | "about" | "intent" | "arrive";

/** Mirrors MIN_SIGNUP_AGE on the backend, which is the real check. */
const MIN_AGE = 18;

function ageOn(iso: string): number | null {
  const d = new Date(`${iso}T00:00:00`);
  if (!iso || Number.isNaN(d.getTime())) return null;
  const t = new Date();
  return t.getFullYear() - d.getFullYear() - (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate()) ? 1 : 0);
}

const STEPS: Record<Mode, Step[]> = {
  signup: ["account", "verify", "about", "intent", "arrive"],
  // The log-in form itself is LoginScreen; after it, members continue here.
  login: ["intent", "arrive"],
};

const ROLES = ["Student", "Professional", "Founder", "Creative", "Educator", "Parent", "Community organiser", "Just here to connect"];
const MEDIA = ["Tech", "Business", "Health", "Education", "Arts & design", "Music", "Sports", "Faith & community", "Food", "Travel", "Parenting", "Volunteering"];


/** Sign in / sign up. Both routes end in "What would feel meaningful today?", the Connection Intent Engine. */
export default function AuthFlow({ mode, startAt }: { mode: Mode; startAt?: string }) {
  const steps = STEPS[mode];
  const router = useRouter();
  const [step, setStep] = useState<Step>(STEPS[mode].includes(startAt as Step) && startAt !== "verify" ? (startAt as Step) : steps[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const intent = INTENTS.find((i) => i.id === intentId);
  const first = name.trim().split(" ")[0] || (email.split("@")[0] ?? "");
  const idx = steps.indexOf(step);

  const errs = {
    name: mode === "signup" && name.trim().length < 2 ? "Tell us what to call you." : "",
    email: /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email address.",
    // Loose check here; the server validates it properly (Nigerian mobile numbers).
    phone: /^\+?[\d\s()-]{10,18}$/.test(phone.trim()) && phone.replace(/\D/g, "").length >= 10 ? "" : "Enter your mobile number, e.g. 0803 123 4567.",
    password: STRONG.test(password) ? "" : STRONG_HINT,
    dob: ageOn(dob) === null ? "Enter your date of birth." : (ageOn(dob) as number) < MIN_AGE ? `You need to be ${MIN_AGE} or older to join Akines.` : "",
    agree: mode === "signup" && !agree ? "Please accept the community promises to continue." : "",
  };
  const accountOk = !errs.name && !errs.email && !errs.phone && !errs.dob && !errs.password && !errs.agree;

  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };
  const next = () => go(steps[Math.min(idx + 1, steps.length - 1)]);
  const back = () => go(steps[Math.max(idx - 1, 0)]);

  const mail = email.trim().toLowerCase();

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!accountOk || busy) return;
    setBusy(true);
    setFailure(null);
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const r = await auth("register", { email: mail, phone_number: phone.trim(), date_of_birth: dob, password, first_name: firstName, last_name: rest.join(" ") });
    setBusy(false);
    if (!r.ok) return setFailure(r.message);
    setTried(false);
    setNotice(`We sent a 6-digit code to ${mail}. It expires in 10 minutes.`);
    next();
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const otp = code.replace(/\D/g, "");
    if (!/^\d{6}$/.test(otp) || busy) return;
    setBusy(true);
    setFailure(null);
    const r = await auth<{ user?: Member }>("verify-email", { email: mail, otp });
    if (!r.ok) {
      setBusy(false);
      return setFailure(r.message);
    }
    rememberMember(r.data?.user ?? {});
    setBusy(false);
    setTried(false);
    setNotice(null);
    next();
  };

  const resendCode = async () => {
    const r = await auth("resend-email", { email: mail });
    setFailure(r.ok ? null : r.message);
    setNotice(r.ok ? "A new code is on its way." : null);
  };

  const finish = (skip = false) => {
    rememberChoices({ intent: skip ? null : intentId, role, city, media });
    // Skipping goes straight in; choosing a reason shows one suggested first step.
    if (skip) router.push("/");
    else next();
  };

  const toggle = (m: string) => setMedia((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="bg pattern-adire" aria-hidden />
        <Link href="/about" className="auth-brand" aria-label="Akines"><Image src="/akines/mark.svg" alt="" width={32} height={32} priority /><span>AKINES</span></Link>
        <div className="auth-collage" aria-hidden>
          <div className="t a"><Pic name="kincircleHero" sizes="30vw" position="50% 30%" priority /></div>
          <div className="t b"><Pic name="talkLaugh" sizes="20vw" position="50% 40%" priority /></div>
          <div className="t c"><Pic name="talkCafe" sizes="20vw" position="50% 40%" priority /></div>
          <div className="t d"><Pic name="talkGroup" sizes="20vw" position="50% 40%" priority /></div>
        </div>
        <div className="auth-quote">
          <div className="auth-kicker">akines</div>
          <h2>Less scrolling. <em>More belonging.</em></h2>
          <p>Akines brings people together on purpose: friends, families, teams, students and professionals from every line of work, through honest conversation, small circles and things you make together.</p>
          <div className="auth-points">
            <div><b>◇</b>Introductions that come with a reason, not a wall of profiles.</div>
            <div><b>◎</b>Banter, KinCircles, live rooms and collaborations in one place.</div>
            <div><b>♡</b>Kind by design: no follower counts, and AI that never diagnoses.</div>
          </div>
          <small className="auth-copy">© 2026 Akines. Built for real connection.</small>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-top">
          <Link href="/about" className="mbrand" aria-label="Akines"><Image src="/akines/mark.svg" alt="" width={24} height={24} /><span>AKINES</span></Link>
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
              <div className="ac-eyebrow">{mode === "signup" ? "Join Akines" : "Welcome back"}</div>
              <h1>{mode === "signup" ? <>Take a seat. <em>Stay awhile.</em></> : <>Good to see <em>you again.</em></>}</h1>
              <p className="auth-lead">
                {mode === "signup"
                  ? "Create your Akines account. It takes a minute, and the next questions are what make the place feel like yours."
                  : "Sign in to pick up where you left off."}
              </p>

              {failure && <p className="auth-fail" role="alert">{failure}</p>}

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
                <label htmlFor="phone">Mobile number <small>One account per number</small></label>
                <div className={`auth-input${tried && errs.phone ? " bad" : ""}`}>
                  <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                {tried && errs.phone && <span className="auth-err">{errs.phone}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="dob">Date of birth <small>Never shown on your profile</small></label>
                <div className={`auth-input${tried && errs.dob ? " bad" : ""}`}>
                  <input id="dob" type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                {tried && errs.dob && <span className="auth-err">{errs.dob}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className={`auth-input${tried && errs.password ? " bad" : ""}`}>
                  <input id="password" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
                </div>
                {tried && errs.password ? <span className="auth-err">{errs.password}</span> : <span className="auth-hint">12+ characters with upper and lower case letters, a number and a symbol.</span>}
              </div>

              {(
                <>
                  <label className="auth-check">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I'll come as myself, keep what's said in rooms in the room, and treat what people share and make with care. I accept the <a href="#" onClick={(e) => e.preventDefault()}>community promises</a>.</span>
                  </label>
                  {tried && errs.agree && <span className="auth-err" style={{ display: "block", margin: "-10px 0 14px" }}>{errs.agree}</span>}
                </>
              )}

              <button className="auth-cta" type="submit" disabled={busy}>{busy ? "Creating your account…" : "Create my account →"}</button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={submitCode} noValidate>
              <div className="ac-eyebrow">Confirm your email</div>
              <h1>Check your <em>inbox.</em></h1>
              {notice && <p className="auth-lead" role="status">{notice}</p>}
              {failure && <p className="auth-fail" role="alert">{failure}</p>}
              <div className="auth-field">
                <label htmlFor="code">6-digit code</label>
                <div className={`auth-input${tried && !/^\d{6}$/.test(code.replace(/\D/g, "")) ? " bad" : ""}`}>
                  <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123 456" value={code} onChange={(e) => setCode(e.target.value)} className="auth-code" />
                </div>
                {tried && !/^\d{6}$/.test(code.replace(/\D/g, "")) && <span className="auth-err">Enter the 6-digit code from the email.</span>}
              </div>
              <button className="auth-cta" type="submit" disabled={busy}>{busy ? "Checking…" : "Confirm and continue →"}</button>
              <div className="auth-actions" style={{ justifyContent: "center" }}>
                <button type="button" className="auth-ghost" onClick={resendCode}>Send a new code</button>
                <button type="button" className="auth-ghost" onClick={() => { setFailure(null); setCode(""); go("account"); }}>Use a different email</button>
              </div>
            </form>
          )}

          {step === "about" && (
            <div>
              <div className="ac-eyebrow">A little about you</div>
              <h1>Which chair <em>are you sitting in?</em></h1>
              <p className="auth-lead">Optional, and only used to introduce you to the right people. You can change every answer later.</p>

              <div className="auth-label">I am mostly a… <small>choose one</small></div>
              <div className="auth-pills">
                {ROLES.map((r) => <button key={r} type="button" className={`auth-pill${role === r ? " on" : ""}`} onClick={() => setRole(r)}>{r}</button>)}
              </div>

              <div className="auth-label">What are you into, or working on? <small>pick any</small></div>
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
              <div className="ac-eyebrow">One quick question</div>
              <h1>What brings you here <em>today?</em></h1>
              <p className="auth-lead">
                {mode === "login" ? `Welcome back${first ? `, ${first}` : ""}. ` : ""}Pick one and we'll suggest a good place to start. It only shapes suggestions, is never shown on your profile, and you can change it anytime.
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
                <button className="auth-ghost" onClick={() => finish(true)}>Skip and go to Home →</button>
              </div>
            </div>
          )}

          {step === "arrive" && (
            <div>
              <div className="ac-eyebrow">{mode === "signup" ? "You're in" : "Signed in"}</div>
              <h1>{mode === "signup" ? "Welcome to Akines" : "Welcome back"}{first ? <>, <em>{first}.</em></> : "."}</h1>
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
                <Link className="a" href={intent?.cta.href ?? "/"}>{intent ? `${intent.cta.label} →` : "Go to Home →"}</Link>
                <Link className="b" href="/">{intent ? "Go to Home" : "See what's live"}</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
