"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { FACE, type FaceKey } from "@/lib/data/images";
import { SESSION_KEY } from "@/lib/session";

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

/** The Akines mark: three people holding each other in a circle. */
export function AkinesMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="lg-mark">
      {[0, 120, 240].map((r) => (
        <g key={r} transform={`rotate(${r} 50 50)`}>
          <circle cx="50" cy="11" r="7.5" />
          <path d="M27 27 Q50 15 73 27" />
        </g>
      ))}
    </svg>
  );
}

function remember(data: Record<string, unknown>) {
  try {
    const prev = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...data }));
  } catch {
    /* prototype only: the flow works without storage */
  }
}

/** Sign in. After it, the member answers "What would feel meaningful today?" in the existing flow. */
export default function LoginScreen() {
  const router = useRouter();
  const [who, setWho] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);

  const errs = { who: who.trim() ? "" : "Enter your mobile number, username or email.", password: password ? "" : "Enter your password." };

  const enter = (id: string) => {
    const name = id.includes("@") ? id.split("@")[0] : id;
    remember({ name, email: id.includes("@") ? id : `${id.replace(/\s+/g, "")}@akines.local` });
    router.push("/login?step=intent");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errs.who || errs.password) return;
    enter(who.trim());
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
            {RING.map((p, i) => {
              const a = (i / RING.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / RING.length;
              const style = { left: `${50 + 41 * Math.cos(a)}%`, top: `${50 + 41 * Math.sin(a)}%`, ["--d" as string]: `${i * 60}ms` } as React.CSSProperties;
              return (
                <span key={i} className="lg-tile" style={{ ...style, ["--ring" as string]: p.bg } as React.CSSProperties}>
                  <Image src={FACE[p.face].src} alt="" fill sizes="96px" className="object-cover" />
                </span>
              );
            })}
            <span className="lg-core"><AkinesMark size={64} /></span>
          </div>
        </section>

        <section className="lg-form-wrap">
          <form className="lg-form" onSubmit={submit} noValidate>
            <h2>Log into Akines</h2>

            <label className="sr-only" htmlFor="lg-who">Mobile number, username or email</label>
            <input id="lg-who" className={`lg-input${tried && errs.who ? " bad" : ""}`} autoComplete="username" placeholder="Mobile number, username or email" value={who} onChange={(e) => setWho(e.target.value)} />
            {tried && errs.who && <span className="lg-err">{errs.who}</span>}

            <label className="sr-only" htmlFor="lg-pw">Password</label>
            <div className={`lg-input lg-pw${tried && errs.password ? " bad" : ""}`}>
              <input id="lg-pw" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {show && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
            {tried && errs.password && <span className="lg-err">{errs.password}</span>}

            <button type="submit" className="lg-primary">Login</button>
            <a href="#" className="lg-forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>

            <div className="lg-alt">
              <button type="button" className="lg-google" onClick={() => enter("amara@example.com")}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                Login with Google
              </button>
              <Link href="/signup" className="lg-outline">Create New Account</Link>
            </div>
            <p className="lg-fine">Prototype: nothing is sent anywhere. Any details will do.</p>
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
