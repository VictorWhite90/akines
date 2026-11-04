"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, type Member } from "@/lib/api/client";
import { DEMO } from "@/lib/demo/mode";
import { previewAsGuest, rememberMember, signOut } from "@/lib/session";
import { ArrowRight, X } from "lucide-react";
import "./auth.css";

/** Matches the backend rule: 12+ characters with upper and lower case, a number and a symbol. */
export const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
export const STRONG_HINT = "Use at least 12 characters, with upper and lower case letters, a number and a symbol.";

/** The Akines logo mark (vector, from the Figma file), the same one used on About and in the rail. */
export function AkinesMark({ size = 72 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- small brand SVG
  return <img src="/akines/mark.svg" alt="" width={size} height={size} className="au-mark" />;
}

type View = "login" | "verify" | "2fa" | "forgot" | "reset";

/** Sign in against the Akines API, then Home. */
export default function LoginScreen({ signedOut = false, sessionEnded = false }: { signedOut?: boolean; sessionEnded?: boolean }) {
  const router = useRouter();
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
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(sessionEnded ? "You were signed out of this device. Log in again to continue." : null);
  const [failure, setFailure] = useState<string | null>(null);

  const errs = {
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? "" : "Enter the email you signed up with.",
    password: view === "login" && !password ? "Enter your password." : view === "reset" && !STRONG.test(password) ? STRONG_HINT : "",
    code: (view === "verify" || view === "2fa" || view === "reset") && !/^\d{6}$/.test(code.replace(/\D/g, "")) ? "Enter the 6-digit code from your email." : "",
  };

  const switchTo = (v: View, message: string | null = null) => {
    setView(v);
    setTried(false);
    setFailure(null);
    setNotice(message);
    setCode("");
    if (v !== "login") setPassword("");
  };

  // Returning members go straight to Home; "What brings you here?" is asked once, during sign-up.
  const signedIn = (data: { user?: Member }) => {
    if (data.user) rememberMember(data.user);
    router.replace("/");
    router.refresh();
  };

  // Demo mode only (no backend): one tap into the app as the sample member.
  const continueAsGuest = async () => {
    if (!(await previewAsGuest())) return;
    router.replace("/");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const fields = view === "login" ? ["email", "password"] : view === "verify" || view === "2fa" ? ["code"] : view === "forgot" ? ["email"] : ["code", "password"];
    if (fields.some((f) => errs[f as keyof typeof errs])) return;
    setBusy(true);
    setFailure(null);
    const mail = email.trim().toLowerCase();
    const otp = code.replace(/\D/g, "");
    try {
      if (view === "login") {
        const r = await auth<{ redirect_to_2fa?: boolean; redirect_to_verify_email?: boolean; user?: Member }>("login", { email: mail, password });
        if (!r.ok) return setFailure(r.message);
        if (r.data?.redirect_to_verify_email) return switchTo("verify", `Confirm your email first: we sent a 6-digit code to ${mail}.`);
        if (r.data?.redirect_to_2fa) return switchTo("2fa", `We sent a 6-digit code to ${mail}.`);
        return signedIn(r.data ?? {});
      }
      if (view === "verify" || view === "2fa") {
        const r = await auth<{ user?: Member }>(view === "verify" ? "verify-email" : "verify-2fa", { email: mail, otp });
        return r.ok ? signedIn(r.data ?? {}) : setFailure(r.message);
      }
      if (view === "forgot") {
        const r = await auth("forgot", { email: mail });
        return r.ok ? switchTo("reset", `If ${mail} has an account, we've sent it a 6-digit code.`) : setFailure(r.message);
      }
      const v = await auth("verify-reset", { email: mail, otp });
      if (!v.ok) return setFailure(v.message);
      const r = await auth("reset", { email: mail, password });
      return r.ok ? switchTo("login", "Password changed. Log in with your new password.") : setFailure(r.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    const r = await auth(view === "2fa" ? "resend-2fa" : view === "verify" ? "resend-email" : "forgot", { email: email.trim().toLowerCase() });
    setFailure(r.ok ? null : r.message);
    setNotice(r.ok ? "A new code is on its way." : null);
  };

  const title = view === "login" ? "Log in to Akines" : view === "2fa" || view === "verify" ? "Check your email" : view === "forgot" ? "Reset your password" : "Choose a new password";

  return (
    <div className="au au-signin">
      {/* The landing photograph, softened, behind the panel (desktop and tablet). */}
      <div className="au-backdrop" aria-hidden>
        <Image src="/landing/images/hero.jpg" alt="" fill priority sizes="100vw" />
      </div>
      <main className="au-panel">
        <div className="au-bar">
          <Link href="/landing" className="au-close" aria-label="Close and go to the Akines home page">
            <X size={20} strokeWidth={1.5} aria-hidden /><span>Close</span>
          </Link>
          <Link href="/landing" className="au-logo" aria-label="Akines"><AkinesMark size={30} /><span>AKINES</span></Link>
        </div>

        <form className="au-form" onSubmit={submit} noValidate aria-busy={busy}>
          <h1 className={view === "login" ? "sr-only" : "au-h"}>{title}</h1>
          {notice && <p className="au-note" role="status">{notice}</p>}
          {failure && <p className="au-fail" role="alert">{failure}</p>}

          {(view === "login" || view === "forgot") && (
            <div className="au-field">
              <label htmlFor="lg-email">Email</label>
              <input id="lg-email" type="email" inputMode="email" className="au-input" aria-invalid={tried && !!errs.email} autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {tried && errs.email && <span className="au-err">{errs.email}</span>}
            </div>
          )}

          {(view === "verify" || view === "2fa" || view === "reset") && (
            <div className="au-field">
              <label htmlFor="lg-code">6-digit code</label>
              <input id="lg-code" className="au-input au-code" aria-invalid={tried && !!errs.code} inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123 456" value={code} onChange={(e) => setCode(e.target.value)} />
              {tried && errs.code && <span className="au-err">{errs.code}</span>}
            </div>
          )}

          {(view === "login" || view === "reset") && (
            <div className="au-field">
              <label htmlFor="lg-pw">{view === "reset" ? "New password" : "Password"}</label>
              <div className="au-input au-pw" aria-invalid={tried && !!errs.password}>
                <input id="lg-pw" type={show ? "text" : "password"} autoComplete={view === "reset" ? "new-password" : "current-password"} placeholder={view === "reset" ? "At least 12 characters" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
              </div>
              {tried && errs.password && <span className="au-err">{errs.password}</span>}
            </div>
          )}

          <button type="submit" className="au-primary" disabled={busy}>
            <span>{busy ? "Please wait…" : view === "login" ? "Log in" : view === "2fa" || view === "verify" ? "Verify and log in" : view === "forgot" ? "Send reset code" : "Change password"}</span>
            {!busy && <ArrowRight size={14} strokeWidth={2} aria-hidden />}
          </button>

          {view === "login" ? (
            <button type="button" className="au-quiet" onClick={() => switchTo("forgot")}>Forgot password?</button>
          ) : (
            <span className="au-links">
              {view !== "forgot" && <button type="button" className="au-quiet" onClick={resend}>Send a new code</button>}
              <button type="button" className="au-quiet" onClick={() => switchTo("login")}>Back to log in</button>
            </span>
          )}

          {view === "login" && DEMO && (
            <>
              <div className="au-or"><span>or</span></div>
              <button type="button" className="au-outline" onClick={continueAsGuest}>Preview as guest</button>
              <small className="au-small">Demo: sample data only. Any email and password sign you in, and any 6-digit code works.</small>
            </>
          )}

          {view === "login" && <p className="au-switch">Don&apos;t have an account? <Link href="/signup">Create an account</Link></p>}
        </form>

        <p className="au-tagline">Less scrolling. More belonging.</p>
      </main>
    </div>
  );
}
