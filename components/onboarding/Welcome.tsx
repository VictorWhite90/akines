"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { signOut, startGuest } from "@/lib/session";

const CAST: { id: PersonId; color: string; reply: string }[] = [
  { id: "kwame", color: "#ffb000", reply: "Leave the left edge open." },
  { id: "zuri", color: "#e5007e", reply: "The unfinished part is the honest part." },
  { id: "ayo", color: "#00a86b", reply: "I left a panel half-dyed on purpose." },
  { id: "tunde", color: "#2547d0", reply: "Voice note · 0:48" },
  { id: "thandi", color: "#ff6b1a", reply: "Make it useless on purpose." },
  { id: "wanjiru", color: "#7b2ff7", reply: "Photograph it before you finish." },
];

const SCENES = [
  { kicker: "Banter", title: "One honest question finds your people.", q: "Can an unfinished artwork still be honest?" },
  { kicker: "KinCircle", title: "Small circles. Real purpose.", q: "Six of us. Eight weeks. One disappearing market." },
  { kicker: "Together", title: "Talk, play and make something real.", q: "What could five artists from five countries create?" },
];

/** First screen for people who aren't signed in: an animated scene of people gathering, then sign up or sign in. */
export default function Welcome({ signedOut = false }: { signedOut?: boolean }) {
  const router = useRouter();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (signedOut) signOut();
  }, [signedOut]);

  useEffect(() => {
    const t = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 5200);
    return () => clearInterval(t);
  }, []);

  const s = SCENES[scene];
  const guest = () => {
    startGuest();
    router.push("/");
  };

  return (
    <div className="wl">
      <span className="wl-glow" aria-hidden />
      <header className="wl-top">
        {/* eslint-disable-next-line @next/next/no-img-element -- brand logo */}
        <img src="/akines_logo_transparent.png" alt="Akines" className="wl-logo" />
        <Link href="/about" className="wl-about">What is Akines?</Link>
      </header>

      <main className="wl-main">
        <section className="wl-scene" aria-hidden>
          <svg className="wl-threads" viewBox="0 0 400 400">
            {CAST.map((c, i) => {
              const a = (i / CAST.length) * Math.PI * 2 - Math.PI / 2;
              return <line key={c.id} x1="200" y1="200" x2={200 + 150 * Math.cos(a)} y2={200 + 150 * Math.sin(a)} stroke={c.color} style={{ animationDelay: `${0.9 + i * 0.35}s` }} />;
            })}
          </svg>
          {CAST.map((c, i) => {
            const a = (i / CAST.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <span key={c.id} className="wl-person" style={{ left: `${50 + 37.5 * Math.cos(a)}%`, top: `${50 + 37.5 * Math.sin(a)}%`, ["--c" as string]: c.color, ["--d" as string]: `${0.5 + i * 0.35}s` } as React.CSSProperties}>
                <span className="wl-ava"><Avatar person={PEOPLE[c.id]} size={64} /></span>
                <span className="wl-say" style={{ ["--d2" as string]: `${1.4 + i * 0.35}s` } as React.CSSProperties}>{c.reply}</span>
              </span>
            );
          })}
          <div key={scene} className="wl-q">
            <small>{s.kicker}</small>
            <b>{s.q}</b>
          </div>
        </section>

        <section className="wl-copy">
          <p className="wl-kicker" key={`k${scene}`}>{s.kicker}</p>
          <h1 key={`t${scene}`}>{s.title}</h1>
          <p className="wl-lede">Akines is where creative people find each other on purpose: fewer people, real conversations, things made together. No followers. No likes. No endless feed.</p>
          <div className="wl-dots" role="tablist" aria-label="Scenes">
            {SCENES.map((x, i) => <button key={x.kicker} role="tab" aria-selected={i === scene} className={i === scene ? "on" : undefined} onClick={() => setScene(i)} aria-label={x.kicker} />)}
          </div>
          <div className="wl-ctas">
            <Link href="/signup" className="wl-primary">Create your account</Link>
            <Link href="/login" className="wl-secondary">I already have an account</Link>
          </div>
          <button className="wl-guest" onClick={guest}>Just looking? Peek inside as a guest →</button>
        </section>
      </main>
    </div>
  );
}
