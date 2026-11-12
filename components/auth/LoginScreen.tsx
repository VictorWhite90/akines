"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth, type Member } from "@/lib/api/client";
import { DEMO } from "@/lib/demo/mode";
import { handOff, handoffDone, takeHandoff, type GoogleSignup } from "@/lib/google";
import { previewAsGuest, rememberMember, signOut } from "@/lib/session";
import Logo from "@/components/kin/Logo";
import GoogleButton from "./GoogleButton";
import { AuField, AuSubmit, IconClose, OrRule, Provider, ShowToggle } from "./parts";
import "./auth.css";

/** Matches the backend rule: 12+ characters with upper and lower case, a number and a symbol. */
export const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
export const STRONG_HINT = "Use at least 12 characters, with upper and lower case letters, a number and a symbol.";

type View = "login" | "verify" | "2fa" | "forgot" | "reset";
const EXIT_MS = 280;
// iframe: Google's button (GoogleButton lays it over the design's, which is then inert).
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Sign in, as the product design draws it: a panel over the landing page (full screen on phones).
 * Signs in with a mobile number, username or email and the password, then a code when the account needs one.
 */
export default function LoginScreen({ signedOut = false, sessionEnded = false }: { signedOut?: boolean; sessionEnded?: boolean }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  // ?signout=1 (from Sign out) ends the session on the server too.
  useEffect(() => {
    if (!signedOut) return;
    void signOut().then(() => router.replace("/login"));
  }, [signedOut, router]);
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<{ id: string | null; pw: string | null; code: string | null }>({ id: null, pw: null, code: null });
  const [busy, setBusy] = useState(false);
  /** From login when two-step is on: proves the password step, so only this screen can finish with the code. */
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  /** From a confirmed reset code: lets this screen set the new password (kept for a retry if the password is refused). */
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(sessionEnded ? "You were signed out of this device. Log in again to continue." : null);
  const [providerNote, setProviderNote] = useState<{ text: string; tone?: "error" } | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  // A two-step member who continued with Google on Join: ask for the code here.
  useEffect(() => {
    const pending = takeHandoff("2fa");
    if (!pending) return;
    /* eslint-disable react-hooks/set-state-in-effect -- picks up the hand-off once, after the panel opens */
    setEmail(pending.identifier);
    setView("2fa");
    setNotice(`We sent a 6-digit code to ${pending.identifier}.`);
    setMfaToken(pending.mfa_token);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  /** Close: the panel slides out, then the landing page. */
  const close = useCallback((after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const go = () => (after ? after() : router.push("/landing"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return go();
    setClosing(true);
    window.setTimeout(go, EXIT_MS);
  }, [router]);

  // Focus the close button first, keep focus inside the panel, Escape closes.
  useEffect(() => {
    // Focus moves to Close, as the design's live panel and the menu do.
    closeBtn.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !root.current) return;
      const list = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null && !n.closest("[inert]"));
      if (!list.length) return;
      const a = list[0], z = list[list.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === a || !root.current.contains(cur))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && (cur === z || !root.current.contains(cur))) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", key);
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); html.style.overflow = prev; };
  }, [close]);

  const switchTo = (v: View, message: string | null = null) => {
    setView(v);
    setErr({ id: null, pw: null, code: null });
    setNotice(message);
    setCode("");
    if (v !== "login") setPassword("");
    if (v !== "2fa") { setMfaToken(null); handoffDone("2fa"); }
    if (v !== "reset") setResetToken(null);
  };

  const signedIn = (data: { user?: Member }) => {
    handoffDone("2fa");
    if (data.user) rememberMember(data.user);
    close(() => { router.replace("/"); router.refresh(); });
  };

  // Demo mode only (no backend): one tap into the app as the sample member.
  const continueAsGuest = async () => {
    if (!(await previewAsGuest())) return;
    close(() => { router.replace("/"); router.refresh(); });
  };

  const submit = async () => {
    if (busy) return;
    const mail = email.trim();
    const otp = code.replace(/\D/g, "");
    const needId = view === "login" || view === "forgot";
    const needPw = view === "login" || view === "reset";
    const needCode = view === "verify" || view === "2fa" || view === "reset";
    const next = {
      id: needId ? (!mail ? "Enter your mobile number, username or email." : null) : null,
      pw: needPw ? (!password ? (view === "reset" ? "Create a password." : "Enter your password.") : view === "reset" && !STRONG.test(password) ? STRONG_HINT : null) : null,
      code: needCode ? (otp.length < 6 ? "Enter the 6-digit code." : null) : null,
    };
    if (next.id || next.pw || next.code) {
      setErr(next);
      (next.id ? idRef : pwRef).current?.focus();
      return;
    }
    setErr({ id: null, pw: null, code: null });
    setBusy(true);
    try {
      if (view === "login") {
        const r = await auth<{ redirect_to_2fa?: boolean; redirect_to_verify_email?: boolean; mfa_token?: string; user?: Member }>("login", { identifier: mail, password });
        // A wrong password and an unknown account read the same, as the design says it.
        if (!r.ok) { setErr({ id: null, pw: r.status === 400 ? "That password doesn't match this account." : r.message, code: null }); pwRef.current?.focus(); return; }
        if (r.data?.redirect_to_verify_email) return switchTo("verify", `Confirm your email first: we sent a 6-digit code to ${mail}.`);
        if (r.data?.redirect_to_2fa) {
          switchTo("2fa", `We sent a 6-digit code to ${mail}.`);
          setMfaToken(r.data.mfa_token ?? null);
          return;
        }
        return signedIn(r.data ?? {});
      }
      if (view === "verify" || view === "2fa") {
        const r = view === "verify"
          ? await auth<{ user?: Member }>("verify-email", { identifier: mail, otp })
          : await auth<{ user?: Member }>("verify-2fa", { mfa_token: mfaToken, otp });
        // The two-step sign-in expired (10 minutes): start again from the password.
        if (!r.ok && view === "2fa" && r.status === 401) return switchTo("login", r.message);
        return r.ok ? signedIn(r.data ?? {}) : setErr({ id: null, pw: null, code: r.message || "That code doesn't match. Check it and try again." });
      }
      if (view === "forgot") {
        const r = await auth("forgot", { identifier: mail });
        return r.ok ? switchTo("reset", `If ${mail} has an account, we've sent a 6-digit code to its email or mobile number.`) : setErr({ id: r.message, pw: null, code: null });
      }
      let token = resetToken;
      if (!token) {
        const v = await auth<{ reset_token?: string }>("verify-reset", { identifier: mail, otp });
        if (!v.ok || !v.data?.reset_token) return setErr({ id: null, pw: null, code: v.ok ? "Something went wrong. Please try again." : v.message });
        token = v.data.reset_token;
        setResetToken(token);
      }
      const r = await auth("reset", { reset_token: token, password });
      if (!r.ok && /expired/i.test(r.message)) { setResetToken(null); return setErr({ id: null, pw: null, code: r.message }); }
      return r.ok ? switchTo("login", "Password changed. Log in with your new password.") : setErr({ id: null, pw: r.message, code: null });
    } finally {
      setBusy(false);
    }
  };

  /** Continue with Google: signs in, asks for the two-step code, or (new to Akines) continues in Join. */
  const continueWithGoogle = async (credential: string) => {
    if (busy || googleBusy) return;
    setProviderNote(null);
    setGoogleBusy(true);
    const r = await auth<{ redirect_to_2fa?: boolean; mfa_token?: string; identifier?: string; needs_signup?: boolean; user?: Member } & Partial<GoogleSignup>>("google", { credential });
    setGoogleBusy(false);
    if (!r.ok) return setProviderNote({ text: r.message, tone: "error" });
    const data = r.data ?? {};
    if (data.needs_signup && data.signup_token && data.email) {
      handOff("signup", { signup_token: data.signup_token, email: data.email, suggested_username: data.suggested_username, first_name: data.first_name });
      return close(() => router.push("/signup"));
    }
    if (data.redirect_to_2fa) {
      const to = data.identifier ?? "";
      setEmail(to);
      switchTo("2fa", `We sent a 6-digit code to ${to}.`);
      setMfaToken(data.mfa_token ?? null);
      return;
    }
    return signedIn(data);
  };

  const resend = async () => {
    const r = view === "2fa"
      ? await auth("resend-2fa", { mfa_token: mfaToken })
      : await auth(view === "verify" ? "resend-email" : "forgot", { identifier: email.trim() });
    if (view === "reset" && r.ok) setResetToken(null);
    setNotice(r.ok ? `A new code is on its way to ${email.trim()}.` : null);
    if (!r.ok) setErr((x) => ({ ...x, code: r.message }));
  };

  const codeField = (
    <AuField label="6-digit code" value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code} placeholder="123 456" inputMode="numeric" autoComplete="one-time-code" maxLength={7} message={err.code ?? undefined} helper={notice ?? undefined} helperTone="success" onChange={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); if (err.code) setErr((x) => ({ ...x, code: null })); }} />
  );

  return (
    <div ref={root} className="au-root" role="dialog" aria-modal="true" aria-labelledby="au-panel-title" data-closing={closing ? "" : undefined}>
      <div className="au-backdrop" onClick={() => close()} aria-hidden />
      <div ref={panelRef} className="au-panel" tabIndex={-1}>
        <h2 id="au-panel-title" className="sr-only">Sign in to Akines</h2>
        <div className="au-head">
          <button ref={closeBtn} type="button" className="au-close" onClick={() => close()} aria-label="Close">
            <IconClose size={20} />
            <span className="au-close__label" aria-hidden>Close</span>
          </button>
          <Logo className="au-head__logo" />
          <span className="au-head__spacer" aria-hidden />
        </div>
        <div className="au-rule" />
        <div className="au-gap au-gap--a" />
        <form className="au-form" noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <div className="au-form__main">
            {view !== "login" && notice && !(view === "verify" || view === "2fa" || view === "reset") ? <p className="au-helper" data-tone="success" role="status">{notice}</p> : null}
            {view === "login" && notice ? <p className="au-helper" role="status">{notice}</p> : null}
            {(view === "login" || view === "forgot") && (
              <AuField label="Mobile number, username or email" value={email} inputRef={idRef} placeholder="e.g. @ndegoyit or 0803 123 4567" inputMode="email" autoComplete="username" message={err.id ?? undefined} onChange={(v) => { setEmail(v); if (err.id) setErr((x) => ({ ...x, id: null })); }} />
            )}
            {(view === "verify" || view === "2fa" || view === "reset") && codeField}
            {(view === "login" || view === "reset") && (
              <AuField label={view === "reset" ? "New password" : "Password"} value={password} inputRef={pwRef} type={show ? "text" : "password"} placeholder={view === "reset" ? "Enter at least 12 characters" : "Enter your password"} autoComplete={view === "reset" ? "new-password" : "current-password"} message={err.pw ?? undefined} action={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />} onChange={(v) => { setPassword(v); if (err.pw) setErr((x) => ({ ...x, pw: null })); }} />
            )}
            <AuSubmit label={view === "login" ? "Log in" : view === "2fa" || view === "verify" ? "Confirm and continue" : view === "forgot" ? "Send a reset code" : "Change password"} type="submit" loading={busy} />
            {view === "login" ? (
              <button type="button" className="au-link au-forgot" onClick={() => switchTo("forgot")}>Forgot password?</button>
            ) : (
              <div className="au-links">
                {view !== "forgot" && <button type="button" className="au-link" onClick={() => void resend()}>Send a new code</button>}
                <button type="button" className="au-link" onClick={() => switchTo("login")}>Back to log in</button>
              </div>
            )}
          </div>
          {view === "login" && (
            <>
              <div className="au-social-block" data-dim={busy ? "" : undefined}>
                <OrRule />
                <div className="au-providers">
                  <GoogleButton busy={googleBusy} onCredential={(c) => void continueWithGoogle(c)} onNotice={(text) => setProviderNote({ text })} unavailable="Signing in with Google isn't available yet. Use your email and password." />
                  <Provider provider="apple" onClick={() => setProviderNote({ text: "Signing in with Apple isn't available yet. Use your email and password." })} />
                </div>
                {providerNote && <p className="au-helper" data-tone={providerNote.tone} role={providerNote.tone === "error" ? "alert" : "status"}>{providerNote.text}</p>}
              </div>
              <p className="au-prompt">
                <span>Don&apos;t have an account?</span>
                <Link href="/signup" className="au-link au-link--inline" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); close(() => router.push("/signup")); }}>Create an account</Link>
              </p>
              {DEMO && <p className="au-prompt"><button type="button" className="au-link au-link--inline" onClick={() => void continueAsGuest()}>Preview as guest</button><span>(demo only)</span></p>}
            </>
          )}
        </form>
        <div className="au-gap au-gap--b" />
        <p className="au-tagline">Less scrolling. More belonging.</p>
      </div>
    </div>
  );
}
