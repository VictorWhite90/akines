"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { FACE, type FaceKey } from "@/lib/data/images";
import { auth, type Member } from "@/lib/api/client";
import { rememberMember, signOut } from "@/lib/session";

/** Matches the backend rule: 12+ characters with upper and lower case, a number and a symbol. */
export const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
export const STRONG_HINT = "Use at least 12 characters, with upper and lower case letters, a number and a symbol.";

/** The ring of people around the mark, each on a soft colour like the design. */
const RING: { face: FaceKey; bg: string }[] = [
  { face: "w3", bg: "#fcd9a4" },
  { face: "m2", bg: "#ffffff" },
  { face: "w10", bg: "#d9f0e6" },
  { face: "amaraFace", bg: "#ffffff" },
  { face: "kwameFace", bg: "#fbe3b8" },
  { face: "w5", bg: "#e2d6fb" },
  { face: "maleFace", bg: "#ffffff" },
  { face: "w8", bg: "#ffd8bf" },
  { face: "m1", bg: "#ffffff" },
  { face: "leilaFace", bg: "#fcd9a4" },
];

/** The Akines logo mark (vector, from the Figma file), the same one used on About and in the rail. */
export function AkinesMark({ size = 72 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- small brand SVG
  return <img src="/akines/mark.svg" alt="" width={size} height={size} className="lg-mark" />;
}

type View = "login" | "verify" | "2fa" | "forgot" | "reset";

/** Sign in against the Akines API. After it, the member answers "What brings you here today?". */
export default function LoginScreen({ signedOut = false }: { signedOut?: boolean }) {
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
  const [notice, setNotice] = useState<string | null>(null);
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

  const signedIn = (data: { user?: Member }) => {
    if (data.user) rememberMember(data.user);
    router.replace("/login?step=intent");
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

  return (
    <div className="lg">
      <div className="lg-theme"><ThemeToggle /></div>

      <main className="lg-main">
        <section className="lg-hero">
          <Link href="/about" className="lg-brand">
            <AkinesMark size={30} />
            <span>AKINES</span>
          </Link>
          <h1>Building better <em>human connection.</em></h1>

          <div className="lg-ring" aria-hidden>
            <div className="lg-orbit">
            {RING.map((p, i) => {
              const a = (i / RING.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / RING.length;
              const style = { left: `${(50 + 40 * Math.cos(a)).toFixed(2)}%`, top: `${(50 + 40 * Math.sin(a)).toFixed(2)}%`, ["--d" as string]: `${i * 60}ms` } as React.CSSProperties;
              return (
                <span key={i} className="lg-tile" style={{ ...style, ["--ring" as string]: p.bg } as React.CSSProperties}>
                  <span className="lg-face"><Image src={FACE[p.face].src} alt="" fill sizes="96px" className="object-cover" /></span>
                </span>
              );
            })}
            </div>
            <span className="lg-core"><AkinesMark size={64} /></span>
          </div>
        </section>

        <section className="lg-form-wrap">
          <form className="lg-form" onSubmit={submit} noValidate aria-busy={busy}>
            <h2>{view === "login" ? "Log into Akines" : view === "2fa" || view === "verify" ? "Check your email" : view === "forgot" ? "Reset your password" : "Choose a new password"}</h2>
            {notice && <p className="lg-note" role="status">{notice}</p>}
            {failure && <p className="lg-fail" role="alert">{failure}</p>}

            {(view === "login" || view === "forgot") && (
              <>
                <label className="sr-only" htmlFor="lg-email">Email</label>
                <input id="lg-email" type="email" inputMode="email" className={`lg-input${tried && errs.email ? " bad" : ""}`} autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {tried && errs.email && <span className="lg-err">{errs.email}</span>}
              </>
            )}

            {(view === "verify" || view === "2fa" || view === "reset") && (
              <>
                <label className="sr-only" htmlFor="lg-code">6-digit code</label>
                <input id="lg-code" className={`lg-input lg-code${tried && errs.code ? " bad" : ""}`} inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
                {tried && errs.code && <span className="lg-err">{errs.code}</span>}
              </>
            )}

            {(view === "login" || view === "reset") && (
              <>
                <label className="sr-only" htmlFor="lg-pw">{view === "reset" ? "New password" : "Password"}</label>
                <div className={`lg-input lg-pw${tried && errs.password ? " bad" : ""}`}>
                  <input id="lg-pw" type={show ? "text" : "password"} autoComplete={view === "reset" ? "new-password" : "current-password"} placeholder={view === "reset" ? "New password" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                      {show && <path d="M4 4l16 16" />}
                    </svg>
                  </button>
                </div>
                {tried && errs.password && <span className="lg-err">{errs.password}</span>}
              </>
            )}

            <button type="submit" className="lg-primary" disabled={busy}>
              {busy ? "Please wait…" : view === "login" ? "Login" : view === "2fa" || view === "verify" ? "Verify and log in" : view === "forgot" ? "Send reset code" : "Change password"}
            </button>

            {view === "login" ? (
              <button type="button" className="lg-forgot" onClick={() => switchTo("forgot")}>Forgot Password?</button>
            ) : (
              <span className="lg-links">
                {view !== "forgot" && <button type="button" className="lg-forgot" onClick={resend}>Send a new code</button>}
                <button type="button" className="lg-forgot" onClick={() => switchTo("login")}>Back to log in</button>
              </span>
            )}

            {view === "login" && (
              <div className="lg-alt">
                <Link href="/signup" className="lg-outline">Create New Account</Link>
              </div>
            )}
          </form>
        </section>
      </main>

      <footer className="lg-foot">
        <nav aria-label="Footer">
          <Link href="/about">About Akines</Link>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact Support</a>
        </nav>
        <small>© 2026 Akines</small>
      </footer>
    </div>
  );
}
