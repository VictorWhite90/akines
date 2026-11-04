"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, type Member } from "@/lib/api/client";
import { account } from "@/lib/api/account";
import { rememberChoices, rememberMember } from "@/lib/session";
import { INTENTS } from "@/lib/data/community";
import Logo from "@/components/kin/Logo";
import { STRONG, STRONG_HINT } from "./LoginScreen";
import { AgeCheck, AuField, AuSubmit, IconTick, Meter, OrRule, Progress, Provider, ShowToggle, StepHeader, type Strength } from "./parts";
import "./auth.css";

type Mode = "login" | "signup";
/**
 * Join, as the product design draws it: five steps on an ivory page. The design asks for the email, a code,
 * then a username and password. Our API creates the account first (with name, mobile and date of birth) and
 * then sends the code, so here the account step comes second and the code third.
 */
type Step = "email" | "account" | "code" | "reason" | "welcome";
const STEPS: Record<Mode, Step[]> = { signup: ["email", "account", "code", "reason", "welcome"], login: ["reason", "welcome"] };
const TITLE: Record<Step, string> = { email: "Join Akines", account: "Create account", code: "Confirm", reason: "Your reason", welcome: "Welcome" };
/** Photos for the nine reasons, in the design's order (public/landing/images). */
const REASON_PHOTO = ["create", "wellbeing", "creation", "continuity", "conversation", "kincircle", "immersive", "mystore", "playtogether"];
const MIN_AGE = 18;
const EXIT_MS = 200;

function ageOn(iso: string): number | null {
  const d = new Date(`${iso}T00:00:00`);
  if (!iso || Number.isNaN(d.getTime())) return null;
  const t = new Date();
  return t.getFullYear() - d.getFullYear() - (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate()) ? 1 : 0);
}
const handleOf = (v: string) => v.trim().replace(/^@/, "");
const HANDLE = /^[A-Za-z0-9_.]{3,20}$/;
function strength(pw: string): Strength {
  if (!pw) return "empty";
  if (pw.length < 12 || !STRONG.test(pw)) return pw.length < 12 ? "weak" : "okay";
  return pw.length < 16 ? "okay" : "strong";
}

export default function AuthFlow({ mode, startAt }: { mode: Mode; startAt?: string }) {
  const steps = STEPS[mode];
  const router = useRouter();
  const first: Step = mode === "login" ? "reason" : "email";
  const [step, setStep] = useState<Step>(startAt === "intent" ? "reason" : startAt === "arrive" ? "welcome" : first);
  const [leaving, setLeaving] = useState(false);
  const [arrived, setArrived] = useState(false);
  const idx = steps.indexOf(step);

  // Step 1
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  // Step 2
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [age, setAge] = useState(false);
  const [tried, setTried] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);
  // Step 3
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  // Step 4
  const [reason, setReason] = useState<number | null>(null);
  const [reasonErr, setReasonErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [handleNote, setHandleNote] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (idx > 0) document.title = `${TITLE[step]} | Akines`;
  }, [step, idx]);
  useEffect(() => {
    if (!arrived) return;
    if (step === "reason" || step === "welcome") heading.current?.focus({ preventScroll: true });
    else firstInput.current?.focus();
  }, [arrived, step]);

  const go = (s: Step) => {
    const swap = () => { setStep(s); setArrived(true); setLeaving(false); setFailure(null); window.scrollTo(0, 0); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return swap();
    setLeaving(true);
    timers.current.push(window.setTimeout(swap, EXIT_MS));
  };

  const mail = email.trim().toLowerCase();
  const h = handleOf(handle);
  const handleState = !h ? (tried ? "missing" : "neutral") : HANDLE.test(h) ? "ok" : /[^A-Za-z0-9_.]/.test(h) || h.length > 20 || tried || handleTouched ? "invalid" : "neutral";
  const lvl = strength(password);
  const ageYears = ageOn(dob);
  const accountErr = {
    name: tried && name.trim().length < 2 ? "Tell us what to call you." : undefined,
    phone: tried && !(/^\+?[\d\s()-]{10,18}$/.test(phone.trim()) && phone.replace(/\D/g, "").length >= 10) ? "Enter your mobile number, e.g. 0803 123 4567." : undefined,
    dob: tried && (ageYears === null ? "Enter your date of birth." : ageYears < MIN_AGE ? `You need to be ${MIN_AGE} or older to join Akines.` : undefined) || undefined,
    handle: handleState === "missing" ? "Choose a username." : handleState === "invalid" ? "Use 3 to 20 letters, numbers, underscores or dots." : undefined,
    password: tried && !password ? "Create a password." : tried && !STRONG.test(password) ? STRONG_HINT : undefined,
    age: tried && !age,
  };

  const submitEmail = () => {
    if (busy) return;
    if (!mail) { setEmailErr("Enter your email."); firstInput.current?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { setEmailErr("Enter a valid email address."); firstInput.current?.focus(); return; }
    setEmailErr(null);
    go("account");
  };

  const submitAccount = async () => {
    if (busy) return;
    setTried(true);
    const bad = name.trim().length < 2 || !(/^\+?[\d\s()-]{10,18}$/.test(phone.trim()) && phone.replace(/\D/g, "").length >= 10) || ageYears === null || ageYears < MIN_AGE || !HANDLE.test(h) || !STRONG.test(password) || !age;
    if (bad) return;
    setBusy(true);
    setFailure(null);
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const r = await auth("register", { email: mail, phone_number: phone.trim(), date_of_birth: dob, password, first_name: firstName, last_name: rest.join(" ") });
    setBusy(false);
    if (!r.ok) {
      if (/already|exists|registered/i.test(r.message)) { setEmailErr("That email already has an account."); go("email"); return; }
      setFailure(r.message);
      return;
    }
    go("code");
  };

  const submitCode = async () => {
    if (busy) return;
    const otp = code.replace(/\D/g, "");
    if (otp.length < 6) { setCodeErr("Enter the 6-digit code."); setSent(false); firstInput.current?.focus(); return; }
    setBusy(true);
    const r = await auth<{ user?: Member }>("verify-email", { email: mail, otp });
    if (!r.ok) {
      setBusy(false);
      setCodeErr(/expire/i.test(r.message) ? "That code has expired. Send a new code." : "That code doesn't match. Check it and try again.");
      setSent(false);
      return;
    }
    rememberMember(r.data?.user ?? {});
    // The username is set on the new account; a clash is not worth blocking sign-up for.
    const u = await account.updateProfile({ username: h });
    if (!u.ok) setHandleNote(`@${h} was taken, so your account has a different username for now. You can change it in Settings.`);
    setBusy(false);
    go("reason");
  };

  const resend = async () => {
    const r = await auth("resend-email", { email: mail });
    setCodeErr(r.ok ? null : r.message);
    setSent(r.ok);
    setCode("");
    firstInput.current?.focus();
  };

  const confirmReason = () => {
    if (busy) return;
    const chosen = reason !== null ? INTENTS[reason] : null;
    if (!chosen) { setReasonErr(true); return; }
    rememberChoices({ intent: chosen.id });
    go("welcome");
  };
  const skipReason = () => { rememberChoices({ intent: null }); go("welcome"); };

  const chosen = reason !== null ? INTENTS[reason] : null;
  const shownStep = step === "reason" ? 4 : step === "welcome" ? 5 : idx + 1;

  return (
    <div className="au-join" data-step={shownStep}>
      <header className="au-bar">
        <Link href="/landing" className="au-bar__logo" aria-label="Akines, home"><Logo /></Link>
        {step === "email" || step === "account" || step === "code" ? (
          <p className="au-bar__prompt"><span>Already a member?</span><Link href="/login" className="au-link au-link--inline">Sign in</Link></p>
        ) : null}
      </header>
      <main className="au-stage" data-wide={step === "reason" ? "" : undefined}>
        <div className="au-step" data-leaving={leaving ? "" : undefined} key={step}>
          {step === "email" && (
            <div className="au-card" data-step="1">
              <Progress step={1} />
              <StepHeader eyebrow="Join Akines" title="Take a seat. Stay awhile." headingRef={heading}>Join with your email. It takes about a minute.</StepHeader>
              <form className="au-flow" noValidate onSubmit={(e) => { e.preventDefault(); submitEmail(); }}>
                <div className="au-group">
                  <AuField label="Email" value={email} inputRef={firstInput} placeholder="you@example.com" inputMode="email" autoComplete="email" message={emailErr ?? undefined} onChange={(v) => { setEmail(v); if (emailErr) setEmailErr(null); }} />
                  {emailErr === "That email already has an account." ? (
                    <Link href="/login" className="au-link au-link--start">Log in instead</Link>
                  ) : emailErr ? null : <p className="au-helper">We&apos;ll send a 6-digit code to confirm it&apos;s you.</p>}
                  <AuSubmit label="Continue" type="submit" />
                </div>
                <OrRule />
                <div className="au-providers">
                  <Provider provider="google" onClick={() => setFailure("Joining with Google isn't available yet. Use your email.")} />
                  <Provider provider="apple" onClick={() => setFailure("Joining with Apple isn't available yet. Use your email.")} />
                </div>
                {failure && <p className="au-helper" role="status">{failure}</p>}
              </form>
            </div>
          )}

          {step === "account" && (
            <div className="au-card" data-step="2">
              <Progress step={2} />
              <StepHeader eyebrow="Almost there" title="Make it yours." headingRef={heading}>A few details, then a username and a password to finish.</StepHeader>
              <form className="au-flow au-flow--account" noValidate onSubmit={(e) => { e.preventDefault(); void submitAccount(); }}>
                {failure && <p className="au-msg" role="alert"><span>{failure}</span></p>}
                <AuField label="Your name" value={name} inputRef={firstInput} placeholder="How friends would say it" autoComplete="name" message={accountErr.name} onChange={setName} />
                <AuField label="Mobile number" value={phone} type="tel" inputMode="tel" placeholder="0803 123 4567" autoComplete="tel" message={accountErr.phone} helper="One account per number." onChange={setPhone} />
                <AuField label="Date of birth" value={dob} type="date" autoComplete="bday" message={accountErr.dob} helper="Never shown on your profile." onChange={setDob} />
                <AuField label="Username" value={handle} placeholder="@username" autoComplete="username" verified={handleState === "ok"} message={accountErr.handle} helper={handleState === "ok" ? `@${h} looks good.` : "3 to 20 characters. Letters, numbers, underscores and dots."} helperTone={handleState === "ok" ? "strong" : "default"} onChange={setHandle} onBlur={() => setHandleTouched(true)} />
                <AuField label="Password" value={password} type={show ? "text" : "password"} placeholder="Enter at least 12 characters" autoComplete="new-password" verified={lvl === "strong"} message={accountErr.password} action={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />} onChange={setPassword} below={<Meter level={lvl} label={lvl === "okay" && !STRONG.test(password) ? "Add upper and lower case letters, a number and a symbol." : undefined} />} />
                <AgeCheck checked={age} onChange={setAge} error={accountErr.age} />
                <AuSubmit label="Create my account" type="submit" loading={busy} />
              </form>
            </div>
          )}

          {step === "code" && (
            <div className="au-card" data-step="3">
              <Progress step={3} />
              <StepHeader eyebrow="Confirm your email" title="Check your inbox." headingRef={heading}>We sent a 6-digit code to {mail}. It expires in 10 minutes.</StepHeader>
              <form className="au-flow au-flow--code" noValidate onSubmit={(e) => { e.preventDefault(); void submitCode(); }}>
                <div className="au-group">
                  <AuField label="6-digit code" value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code} inputRef={firstInput} placeholder="123 456" inputMode="numeric" autoComplete="one-time-code" maxLength={7} message={codeErr ?? undefined} onChange={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); if (codeErr) setCodeErr(null); if (sent) setSent(false); }} />
                  {sent && !codeErr ? <p className="au-helper" data-tone="success" role="status">A new code is on its way to {mail}.</p> : null}
                  <AuSubmit label="Confirm and continue" type="submit" loading={busy} />
                </div>
                <div className="au-links">
                  <button type="button" className="au-link" onClick={() => void resend()}>Send a new code</button>
                  <button type="button" className="au-link" onClick={() => { setCode(""); setCodeErr(null); go("email"); }}>Use a different email</button>
                </div>
              </form>
            </div>
          )}

          {step === "reason" && (
            <div className="au-split" data-step="4">
              <div className="au-intro">
                <div className="au-intro__top">
                  <Progress step={4} />
                  <StepHeader eyebrow="One last thing" title="What brings you here today?" headingRef={heading}>Choose the one closest to the truth. It only helps us show you the right rooms first.</StepHeader>
                  <div className="au-choice">
                    <p className="au-choice__caption">Your choice</p>
                    {chosen ? (
                      <>
                        <p className="au-choice__echo" aria-live="polite">{chosen.label}</p>
                        <p className="au-choice__note">{chosen.headline}</p>
                      </>
                    ) : <p className="au-choice__none" aria-live="polite">Nothing chosen yet.</p>}
                  </div>
                </div>
                <div className="au-intro__bottom">
                  {reasonErr && !chosen ? <p className="au-error" role="alert">Choose one to continue.</p> : null}
                  <AuSubmit label="Confirm my choice" looksDisabled={!chosen} onClick={confirmReason} />
                  <button type="button" className="au-link au-skip" onClick={skipReason}>Skip for now</button>
                </div>
              </div>
              <div className="au-reasons" role="radiogroup" aria-label="What brings you here today?">
                {INTENTS.map((it, i) => {
                  const state = reason === null ? "default" : reason === i ? "selected" : "dimmed";
                  return (
                    <label key={it.id} className="au-reason" data-state={state}>
                      <input type="radio" name="au-reason" className="au-reason__input" checked={state === "selected"} onChange={() => {}} onClick={() => { setReasonErr(false); setReason((r) => (r === i ? null : i)); }} />
                      {/* eslint-disable-next-line @next/next/no-img-element -- the design's photo tiles */}
                      <img className="au-reason__photo" src={`/landing/images/${REASON_PHOTO[i] ?? "conversation"}.jpg`} alt="" loading="lazy" decoding="async" draggable={false} />
                      <span className="au-reason__scrim" aria-hidden />
                      <span className="au-reason__dim" aria-hidden />
                      <span className="au-reason__index" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                      <span className="au-reason__radio" aria-hidden><IconTick size={14} /></span>
                      <span className="au-reason__label">{it.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === "welcome" && (
            <div className="au-card" data-step="5">
              <Progress step={5} />
              {/* eslint-disable-next-line @next/next/no-img-element -- the design's welcome photo */}
              <img className="au-welcome__photo" src="/landing/images/conversation.jpg" alt="" decoding="async" />
              <StepHeader eyebrow="You're in" title={h ? `Welcome to Akines, @${h}.` : mode === "login" ? "Welcome back." : "Welcome to Akines."} headingRef={heading}>
                {handleNote ?? "Your seat is saved. Take a look around. You can add your photo, role and city whenever you like from your profile."}
              </StepHeader>
              <AuSubmit label="Go to Community" onClick={() => { router.push("/"); router.refresh(); }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
