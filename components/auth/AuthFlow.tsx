"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, type Member } from "@/lib/api/client";
import { account } from "@/lib/api/account";
import { handOff, handoffDone, takeHandoff, type GoogleSignup } from "@/lib/google";
import { rememberChoices, rememberMember } from "@/lib/session";
import { INTENTS } from "@/lib/data/community";
import Logo from "@/components/kin/Logo";
import GoogleButton from "./GoogleButton";
import { STRONG, STRONG_HINT } from "./LoginScreen";
import { AgeCheck, AuField, AuSubmit, IconTick, Meter, OrRule, Progress, Provider, ShowToggle, StepHeader, type Strength } from "./parts";
import "./auth.css";
import Img from "@/components/kin/Img";

type Mode = "login" | "signup";
/**
 * Join, as the product design draws it: five steps on an ivory page. An email or mobile number, the 6-digit code
 * sent to it, then a username and password (the account is created here), the reason, and welcome. The backend's
 * signup/start, signup/verify and signup/complete follow the same order; the reason is saved on the account.
 * Continue with Google skips the first two: Google confirmed the email, so Join opens at the username step with that
 * email shown (no password), and auth/google/complete creates the account.
 */
type Step = "email" | "code" | "account" | "reason" | "welcome";
const STEPS: Record<Mode, Step[]> = { signup: ["email", "code", "account", "reason", "welcome"], login: ["reason", "welcome"] };
const TITLE: Record<Step, string> = { email: "Join Akines", code: "Confirm", account: "Create account", reason: "Your reason", welcome: "Welcome" };
/** Photos for the nine reasons, in the design's order (public/landing/images). */
const REASON_PHOTO = ["create", "wellbeing", "creation", "continuity", "conversation", "kincircle", "immersive", "mystore", "playtogether"];
const EXIT_MS = 200;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE = /^\+?\d{10,14}$/;
/** The design's step 1 check: an email, or a mobile number (spaces, brackets, dots and dashes allowed). */
function contactOf(raw: string): { ok: true; kind: "email" | "mobile"; value: string } | { ok: false; error: "missing" | "invalid" } {
  const value = raw.trim();
  if (!value) return { ok: false, error: "missing" };
  if (EMAIL.test(value)) return { ok: true, kind: "email", value: value.toLowerCase() };
  if (MOBILE.test(value.replace(/[\s().-]/g, ""))) return { ok: true, kind: "mobile", value };
  return { ok: false, error: "invalid" };
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

  // Step 1: email or mobile number
  const [contact, setContact] = useState("");
  const [contactErr, setContactErr] = useState<"missing" | "invalid" | null>(null);
  const [mobile, setMobile] = useState(false);
  // Step 2: the code
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [signupToken, setSignupToken] = useState("");
  // Step 3: username and password
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [age, setAge] = useState(false);
  const [tried, setTried] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);
  const [taken, setTaken] = useState<{ name: string; suggestions: string[] } | null>(null);
  // Step 4: the reason
  const [reason, setReason] = useState<number | null>(null);
  const [reasonErr, setReasonErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // Continue with Google: the sign-up Google started (its token and the email Google confirmed).
  const [google, setGoogle] = useState<GoogleSignup | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (steps.indexOf(step) > 0) document.title = `${TITLE[step]} | Akines`;
  }, [step, steps]);
  // A new person who continued with Google on the sign-in panel: pick up at the username step.
  useEffect(() => {
    if (mode !== "signup") return;
    const pending = takeHandoff("signup");
    if (!pending) return;
    /* eslint-disable react-hooks/set-state-in-effect -- picks up the hand-off once, after the page opens */
    setGoogle(pending);
    setHandle(pending.suggested_username ?? "");
    setStep("account");
    setArrived(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mode]);
  useEffect(() => {
    if (!arrived) return;
    if (step === "reason" || step === "welcome") heading.current?.focus({ preventScroll: true });
    else firstInput.current?.focus();
  }, [arrived, step]);

  /** Moves to a step; `message` is shown there (e.g. why Join went back to the first step). */
  const go = (s: Step, message: string | null = null) => {
    const swap = () => { setStep(s); setArrived(true); setLeaving(false); setFailure(message); window.scrollTo(0, 0); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return swap();
    setLeaving(true);
    timers.current.push(window.setTimeout(swap, EXIT_MS));
  };

  const typed = contactOf(contact);
  const shownContact = typed.ok ? typed.value : contact.trim();
  const h = handleOf(handle);
  const isTaken = !!taken && taken.name.toLowerCase() === h.toLowerCase();
  const handleState = !h ? (tried ? "missing" : "neutral") : isTaken ? "taken" : HANDLE.test(h) ? "ok" : /[^A-Za-z0-9_.]/.test(h) || h.length > 20 || tried || handleTouched ? "invalid" : "neutral";
  const lvl = strength(password);
  const accountErr = {
    handle: handleState === "missing" ? "Choose a username." : handleState === "invalid" ? "Use 3 to 20 letters, numbers, underscores or dots." : handleState === "taken" ? "That username is taken." : undefined,
    password: google ? undefined : tried && !password ? "Create a password." : tried && !STRONG.test(password) ? STRONG_HINT : undefined,
    age: tried && !age,
  };

  /** Sends (or re-sends) the code; returns the reason it couldn't, e.g. "wait 42 seconds". */
  const sendCode = async (): Promise<string | null> => {
    if (!typed.ok) return "Enter a valid email address or mobile number.";
    const r = await auth("signup-start", { contact: typed.value });
    return r.ok ? null : r.message;
  };

  const submitContact = async () => {
    if (busy) return;
    if (!typed.ok) { setContactErr(typed.error); firstInput.current?.focus(); return; }
    setContactErr(null);
    setBusy(true);
    setFailure(null);
    const error = await sendCode();
    setBusy(false);
    if (error) { setFailure(error); return; }
    setMobile(typed.kind === "mobile");
    setCode(""); setCodeErr(null); setSent(false);
    go("code");
  };

  const submitCode = async () => {
    if (busy) return;
    const otp = code.replace(/\D/g, "");
    if (otp.length < 6) { setCodeErr("Enter the 6-digit code."); setSent(false); firstInput.current?.focus(); return; }
    setBusy(true);
    const r = await auth<{ signup_token?: string }>("signup-verify", { contact: shownContact, otp });
    setBusy(false);
    if (!r.ok || !r.data?.signup_token) {
      setCodeErr(/expire/i.test(r.ok ? "" : r.message) ? "That code has expired. Send a new code." : !r.ok && r.status === 403 || !r.ok && r.status === 429 ? r.message : "That code doesn't match. Check it and try again.");
      setSent(false);
      return;
    }
    setSignupToken(r.data.signup_token);
    go("account");
  };

  const resend = async () => {
    const error = await sendCode();
    setCodeErr(error);
    setSent(!error);
    setCode("");
    firstInput.current?.focus();
  };

  /** Asks the API whether the username is free; when it isn't, keeps its suggestions for the "Try" chips. */
  const checkHandle = async (name: string) => {
    if (!HANDLE.test(name)) return true;
    const r = await account.usernameAvailable(name);
    if (r.ok && !r.data.available) { setTaken({ name, suggestions: (r.data.suggestions ?? []).map((x) => `@${x}`) }); return false; }
    return true;
  };

  /** Continue with Google on step 1: signs a member in, or carries on here at the username step. */
  const continueWithGoogle = async (credential: string) => {
    if (busy || googleBusy) return;
    setFailure(null);
    setGoogleBusy(true);
    const r = await auth<{ redirect_to_2fa?: boolean; mfa_token?: string; identifier?: string; needs_signup?: boolean; user?: Member } & Partial<GoogleSignup>>("google", { credential });
    setGoogleBusy(false);
    if (!r.ok) { setFailure(r.message); return; }
    const data = r.data ?? {};
    if (data.needs_signup && data.signup_token && data.email) {
      setGoogle({ signup_token: data.signup_token, email: data.email, suggested_username: data.suggested_username, first_name: data.first_name });
      setHandle(data.suggested_username ?? "");
      setTried(false);
      setTaken(null);
      go("account");
      return;
    }
    // Already a member: two-step members finish on the sign-in panel; everyone else is in.
    if (data.redirect_to_2fa && data.mfa_token) {
      handOff("2fa", { mfa_token: data.mfa_token, identifier: data.identifier ?? "" });
      router.push("/login");
      return;
    }
    rememberMember(data.user ?? {});
    router.replace("/");
    router.refresh();
  };

  const submitAccount = async () => {
    if (busy) return;
    setTried(true);
    if (!HANDLE.test(h) || isTaken || (!google && !STRONG.test(password)) || !age) return;
    setBusy(true);
    setFailure(null);
    if (!(await checkHandle(h))) { setBusy(false); return; }
    const r = google
      ? await auth<{ user?: Member }>("google-complete", { signup_token: google.signup_token, username: h, age_confirmed: age })
      : await auth<{ user?: Member }>("signup-complete", { signup_token: signupToken, username: h, password, age_confirmed: age });
    setBusy(false);
    if (!r.ok) {
      if (/username/i.test(r.message) && /exist|taken/i.test(r.message)) { await checkHandle(h); return; }
      if (/expired|start again/i.test(r.message) || (google && r.status === 409)) { handoffDone("signup"); setGoogle(null); setContactErr(null); go("email", r.message); return; }
      setFailure(r.message);
      return;
    }
    if (google) handoffDone("signup");
    rememberMember(r.data?.user ?? {});
    go("reason");
  };

  const confirmReason = async () => {
    if (busy) return;
    const chosen = reason !== null ? INTENTS[reason] : null;
    if (!chosen) { setReasonErr(true); return; }
    setBusy(true);
    rememberChoices({ intent: chosen.id });
    // Saved on the account, so the rooms Akines shows first follow it on every device. Not worth blocking on.
    await account.updateProfile({ intent: chosen.id });
    setBusy(false);
    go("welcome");
  };
  const skipReason = () => { rememberChoices({ intent: null }); go("welcome"); };

  const chosen = reason !== null ? INTENTS[reason] : null;
  const shownStep = steps.indexOf(step) + (mode === "login" ? 4 : 1);

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
              <StepHeader eyebrow="Join Akines" title="Take a seat. Stay awhile." headingRef={heading}>Join with your email or mobile number. It takes about a minute.</StepHeader>
              <form className="au-flow" noValidate onSubmit={(e) => { e.preventDefault(); void submitContact(); }}>
                <div className="au-group">
                  <AuField label="Email or mobile number" value={contact} inputRef={firstInput} placeholder="you@example.com or 0803 123 4567" inputMode="email" autoComplete="email" message={contactErr === "missing" ? "Enter your email or mobile number." : contactErr === "invalid" ? "Enter a valid email address or mobile number." : undefined} onChange={(v) => { setContact(v); if (contactErr) setContactErr(null); }} />
                  {contactErr || busy ? null : <p className="au-helper">We&apos;ll send a 6-digit code to confirm it&apos;s you.</p>}
                  <AuSubmit label="Continue" type="submit" loading={busy} />
                </div>
                <OrRule />
                <div className="au-providers">
                  <GoogleButton busy={googleBusy} onCredential={(c) => void continueWithGoogle(c)} onNotice={setFailure} unavailable="Joining with Google isn't available yet. Use your email or mobile number." />
                  <Provider provider="apple" onClick={() => setFailure("Joining with Apple isn't available yet. Use your email or mobile number.")} />
                </div>
                {failure && <p className="au-helper" role="status">{failure}</p>}
              </form>
            </div>
          )}

          {step === "code" && (
            <div className="au-card" data-step="2">
              <Progress step={2} />
              <StepHeader eyebrow={mobile ? "Confirm your mobile number" : "Confirm your email"} title={mobile ? "Check your messages." : "Check your inbox."} headingRef={heading}>We sent a 6-digit code to {shownContact}. It expires in 10 minutes.</StepHeader>
              <form className="au-flow au-flow--code" noValidate onSubmit={(e) => { e.preventDefault(); void submitCode(); }}>
                <div className="au-group">
                  <AuField label="6-digit code" value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code} inputRef={firstInput} placeholder="123 456" inputMode="numeric" autoComplete="one-time-code" maxLength={7} message={codeErr ?? undefined} onChange={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); if (codeErr) setCodeErr(null); if (sent) setSent(false); }} />
                  {sent && !codeErr ? <p className="au-helper" data-tone="success" role="status">A new code is on its way to {shownContact}.</p> : null}
                  <AuSubmit label="Confirm and continue" type="submit" loading={busy} />
                </div>
                <div className="au-links">
                  <button type="button" className="au-link" onClick={() => void resend()}>Send a new code</button>
                  <button type="button" className="au-link" onClick={() => { setCode(""); setCodeErr(null); go("email"); }}>{mobile ? "Use a different number" : "Use a different email"}</button>
                </div>
              </form>
            </div>
          )}

          {step === "account" && (
            <div className="au-card" data-step="3">
              <Progress step={3} />
              <StepHeader eyebrow="Almost there" title="Make it yours." headingRef={heading}>{google ? "Choose a username to finish. You'll log in with Google." : "Choose a username and a password to finish."}</StepHeader>
              <form className="au-flow au-flow--account" noValidate onSubmit={(e) => { e.preventDefault(); void submitAccount(); }}>
                {failure && <p className="au-msg" role="alert"><span>{failure}</span></p>}
                {google && <AuField label="Email" value={google.email} readOnly verified helper="Confirmed by Google." helperTone="success" />}
                <AuField
                  label="Username" value={handle} inputRef={firstInput} placeholder="@username" autoComplete="username"
                  verified={handleState === "ok"} message={accountErr.handle}
                  helper={handleState === "ok" ? `@${h} is available.` : "3 to 20 characters. Letters, numbers, underscores and dots."}
                  helperTone={handleState === "ok" ? "strong" : "default"}
                  onChange={setHandle}
                  onBlur={() => { setHandleTouched(true); if (HANDLE.test(h)) void checkHandle(h); }}
                  below={isTaken && taken.suggestions.length ? (
                    <div className="au-suggest">
                      <span className="au-suggest__try">Try</span>
                      {taken.suggestions.map((c) => (
                        <button key={c} type="button" className="au-chip" onClick={() => { setHandle(c); firstInput.current?.focus(); }}>{c}</button>
                      ))}
                    </div>
                  ) : null}
                />
                {!google && <AuField label="Password" value={password} type={show ? "text" : "password"} placeholder="Enter at least 12 characters" autoComplete="new-password" verified={lvl === "strong"} message={accountErr.password} action={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />} onChange={setPassword} below={<Meter level={lvl} label={lvl === "okay" && !STRONG.test(password) ? "Add upper and lower case letters, a number and a symbol." : undefined} />} />}
                <AgeCheck checked={age} onChange={setAge} error={accountErr.age} />
                <AuSubmit label="Create my account" type="submit" loading={busy} />
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
                  <AuSubmit label="Confirm my choice" looksDisabled={!chosen} loading={busy} onClick={() => void confirmReason()} />
                  <button type="button" className="au-link au-skip" onClick={skipReason}>Skip for now</button>
                </div>
              </div>
              <div className="au-reasons" role="radiogroup" aria-label="What brings you here today?">
                {INTENTS.map((it, i) => {
                  const state = reason === null ? "default" : reason === i ? "selected" : "dimmed";
                  return (
                    <label key={it.id} className="au-reason" data-state={state}>
                      <input type="radio" name="au-reason" className="au-reason__input" checked={state === "selected"} onChange={() => {}} onClick={() => { setReasonErr(false); setReason((r) => (r === i ? null : i)); }} />
                      <Img className="au-reason__photo" src={`/landing/images/${REASON_PHOTO[i] ?? "conversation"}.jpg`} sizes="(max-width: 767px) 50vw, 240px" draggable={false} />
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
              <Img className="au-welcome__photo" src="/landing/images/conversation.jpg" sizes="(max-width: 767px) 100vw, 480px" loading="eager" />
              <StepHeader eyebrow="You're in" title={h ? `Welcome to Akines, @${h}.` : mode === "login" ? "Welcome back." : "Welcome to Akines."} headingRef={heading}>
                {"Your seat is saved. Take a look around. You can add your photo, role and city whenever you like from your profile."}
              </StepHeader>
              <AuSubmit label="Go to Community" onClick={() => { router.push("/"); router.refresh(); }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
