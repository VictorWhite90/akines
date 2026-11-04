"use client";

import { auth, type Member } from "@/lib/api/client";
import { rememberChoices, rememberMember } from "@/lib/session";
import { STRONG, STRONG_HINT } from "./LoginScreen";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Pic from "@/components/home/Pic";
import DateOfBirth from "@/components/ui/DateOfBirth";
import { INTENTS } from "@/lib/data/community";
import { ArrowRight } from "lucide-react";
import "./auth.css";

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


/** A labelled field with an optional hint and error. Module level, so inputs keep focus while typing. */
function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="au-field">
      <label htmlFor={id}>{label}{hint && <small>{hint}</small>}</label>
      {children}
      {error && <span className="au-err">{error}</span>}
    </div>
  );
}

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
    <div className="au au-join">
      <header className="au-top">
        <Link href="/landing" className="au-logo" aria-label="Akines"><Image src="/akines/mark.svg" alt="" width={30} height={30} priority /><span>AKINES</span></Link>
        {mode === "signup" ? (
          <span className="au-top-switch">Already a member? <Link href="/login">Sign in</Link></span>
        ) : (
          <span className="au-top-switch">New to Akines? <Link href="/signup">Create an account</Link></span>
        )}
      </header>

      <main className={`au-card${step === "intent" || step === "arrive" ? " wide" : ""}`}>
        <div className="au-steps" aria-label={`Step ${idx + 1} of ${steps.length}`}>
          {steps.map((s, i) => <i key={s} className={i <= idx ? "on" : undefined} />)}
        </div>

        {step === "account" && (
          <form onSubmit={submitAccount} noValidate className="au-stack">
            <span className="au-eyebrow">{mode === "signup" ? "Join Akines" : "Welcome back"}</span>
            <h1 className="au-title">{mode === "signup" ? "Take a seat. Stay awhile." : "Good to see you again."}</h1>
            <p className="au-lead">
              {mode === "signup"
                ? "Create your account. It takes about a minute, and the next questions are what make the place feel like yours."
                : "Sign in to pick up where you left off."}
            </p>

            {failure && <p className="au-fail" role="alert">{failure}</p>}

            {mode === "signup" && (
              <Field id="name" label="Your name" error={tried ? errs.name : ""}>
                <input id="name" className="au-input" aria-invalid={tried && !!errs.name} autoComplete="name" placeholder="How friends would say it" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            )}
            <Field id="email" label="Email" error={tried ? errs.email : ""}>
              <input id="email" type="email" className="au-input" aria-invalid={tried && !!errs.email} autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="phone" label="Mobile number" hint="One account per number" error={tried ? errs.phone : ""}>
              <input id="phone" type="tel" inputMode="tel" className="au-input" aria-invalid={tried && !!errs.phone} autoComplete="tel" placeholder="0803 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field id="dob" label="Date of birth" hint="Never shown on your profile" error={tried ? errs.dob : ""}>
              <DateOfBirth id="dob" value={dob} onChange={setDob} minAge={MIN_AGE} invalid={tried && !!errs.dob} className="dob-auth au-dob" />
            </Field>
            <div className="au-field">
              <label htmlFor="password">Password</label>
              <div className="au-input au-pw" data-invalid={tried && !!errs.password}>
                <input id="password" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
              </div>
              {tried && errs.password ? <span className="au-err">{errs.password}</span> : <span className="au-small">12+ characters with upper and lower case letters, a number and a symbol.</span>}
            </div>

            <label className="au-check">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I&apos;ll come as myself, keep what&apos;s said in rooms in the room, and treat what people share and make with care. I accept the <a href="#" onClick={(e) => e.preventDefault()}>community promises</a>.</span>
            </label>
            {tried && errs.agree && <span className="au-err">{errs.agree}</span>}

            <button className="au-primary" type="submit" disabled={busy}><span>{busy ? "Creating your account…" : "Continue"}</span>{!busy && <ArrowRight size={14} strokeWidth={2} aria-hidden />}</button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={submitCode} noValidate className="au-stack">
            <span className="au-eyebrow">Confirm your email</span>
            <h1 className="au-title">Check your inbox.</h1>
            {notice && <p className="au-lead" role="status">{notice}</p>}
            {failure && <p className="au-fail" role="alert">{failure}</p>}
            <Field id="code" label="6-digit code" error={tried && !/^\d{6}$/.test(code.replace(/\D/g, "")) ? "Enter the 6-digit code from the email." : ""}>
              <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123 456" value={code} onChange={(e) => setCode(e.target.value)} className="au-input au-code" aria-invalid={tried && !/^\d{6}$/.test(code.replace(/\D/g, ""))} />
            </Field>
            <button className="au-primary" type="submit" disabled={busy}><span>{busy ? "Checking…" : "Confirm and continue"}</span>{!busy && <ArrowRight size={14} strokeWidth={2} aria-hidden />}</button>
            <div className="au-links">
              <button type="button" className="au-quiet" onClick={resendCode}>Send a new code</button>
              <button type="button" className="au-quiet" onClick={() => { setFailure(null); setCode(""); go("account"); }}>Use a different email</button>
            </div>
          </form>
        )}

        {step === "about" && (
          <div className="au-stack">
            <span className="au-eyebrow">A little about you</span>
            <h1 className="au-title">Which chair are you sitting in?</h1>
            <p className="au-lead">Optional, and only used to introduce you to the right people. You can change every answer later.</p>

            <div className="au-group" role="group" aria-labelledby="au-role">
              <p className="au-label" id="au-role">I am mostly a… <small>choose one</small></p>
              <div className="au-chips">
                {ROLES.map((r) => <button key={r} type="button" className="au-chip" aria-pressed={role === r} onClick={() => setRole(r)}><span className="ind" aria-hidden />{r}</button>)}
              </div>
            </div>

            <div className="au-group" role="group" aria-labelledby="au-media">
              <p className="au-label" id="au-media">What are you into, or working on? <small>pick any</small></p>
              <div className="au-chips">
                {MEDIA.map((m) => <button key={m} type="button" className="au-chip" aria-pressed={media.includes(m)} onClick={() => toggle(m)}><span className="ind" aria-hidden />{m}</button>)}
              </div>
            </div>

            <Field id="city" label="Where are you based?" hint="City only">
              <input id="city" className="au-input" placeholder="Lagos, Nairobi, London…" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>

            <div className="au-row">
              <button className="au-outline" onClick={back}>Back</button>
              <button className="au-primary" onClick={next}><span>Continue</span><ArrowRight size={14} strokeWidth={2} aria-hidden /></button>
            </div>
            <button className="au-quiet center" onClick={next}>Skip this for now</button>
          </div>
        )}

        {step === "intent" && (
          <div className="au-stack">
            <span className="au-eyebrow">One quick question</span>
            <h1 className="au-title">What brings you here today?</h1>
            <p className="au-lead">
              {mode === "login" ? `Welcome back${first ? `, ${first}` : ""}. ` : ""}Pick one and we&apos;ll suggest a good place to start. It only shapes suggestions, is never shown on your profile, and you can change it anytime.
            </p>

            <div className="au-intents" role="radiogroup" aria-label="What brings you here today?">
              {INTENTS.map((i) => (
                <button key={i.id} type="button" role="radio" aria-checked={intentId === i.id} className="au-intent" onClick={() => setIntentId(i.id)}>
                  <span className="ph"><Pic name={i.photo} sizes="(max-width: 900px) 50vw, 240px" /></span>
                  <span className="lbl"><span className="ind" aria-hidden />{i.label}</span>
                </button>
              ))}
            </div>

            {intent && (
              <div className="au-reply" key={intent.id} role="status">
                <p className="h">{intent.headline}</p>
                <p>{intent.body}</p>
              </div>
            )}

            <div className="au-row">
              {mode === "signup" && <button className="au-outline" onClick={back}>Back</button>}
              <button className="au-primary" disabled={!intent} onClick={() => finish()}><span>{intent ? "Continue with this reason" : "Choose a reason to continue"}</span>{intent && <ArrowRight size={14} strokeWidth={2} aria-hidden />}</button>
            </div>
            <button className="au-quiet center" onClick={() => finish(true)}>Skip and go to Community Home</button>
          </div>
        )}

        {step === "arrive" && (
          <div className="au-stack">
            <span className="au-eyebrow">{mode === "signup" ? "You're in" : "Signed in"}</span>
            <h1 className="au-title">{mode === "signup" ? "Welcome to Akines" : "Welcome back"}{first ? `, ${first}.` : "."}</h1>
            <p className="au-lead">
              {mode === "signup" ? "Your account is ready. Here is where we'd start, based on what you told us." : "Here is where we'd pick things up, based on what you told us."}
            </p>

            <div className="au-arrive">
              <div className="ph"><Pic name={intent?.photo ?? "circleInner"} sizes="(max-width: 900px) 100vw, 640px" /></div>
              <div className="tx">
                <span className="au-eyebrow">{intent ? "Your first step" : "Start anywhere"}</span>
                <p className="h">{intent ? intent.headline : "Wander in. The doors are all open."}</p>
                <p>{intent ? intent.body : "No reason needed. You can tell Create AI what would feel meaningful whenever you like."}</p>
              </div>
            </div>

            <div className="au-row">
              <Link className="au-primary" href={intent?.cta.href ?? "/"}><span>{intent ? intent.cta.label : "Go to Community Home"}</span><ArrowRight size={14} strokeWidth={2} aria-hidden /></Link>
              <Link className="au-outline" href="/">{intent ? "Go to Community Home" : "See what's live"}</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
