import type { Metadata } from "next";
import Link from "next/link";
import { AboutFooter, AboutHeader } from "../_components/Chrome";
import Principles from "./Principles";
import Values from "./Values";

export const metadata: Metadata = { title: "Core Philosophy: People First · Akines" };

const FEATURES = ["Banter", "Play Together", "Collaboration Studio", "Creative DNA", "My Store", "KinCircles"];

const GRID = [
  [
    { img: "p1", title: "Connection is feeling known", body: "It is not the number of people we know, but how known, valued and supported we feel." },
    { img: "p2", title: "Beyond profiles and content", body: "Most platforms reward visibility. Akines connects people around intentions, needs and values." },
  ],
  [
    { img: "p3", title: "Technology for real life", body: "It should help people form, deepen and sustain relationships that matter offline too." },
    { img: "p4", title: "More belonging, less screen time", body: "The aim is companionship, collaboration and mutual care, online and offline." },
  ],
];

/** "Read more" from Core Philosophy (Figma: 01 - akines / about / our core philosophy). */
export default function PhilosophyPage() {
  return (
    <>
      <AboutHeader />
      <main className="cp">
        <section className="cp-hero">
          <div className="cp-keys" aria-hidden>
            <span className="k1"><i />Belonging</span>
            <span className="k2"><i />Companionship</span>
            <span className="k3"><i />Collaboration</span>
          </div>
          <h1>Core Philosophy.<br /><em>People First</em></h1>
          <Link href="/login" className="cp-btn">Find Your People <span aria-hidden>→</span></Link>
        </section>

        <div className="cp-photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo */}
          <img src="/akines/philosophy/hero.jpg" alt="Four friends laughing together on a rooftop, holding sparklers" />
        </div>

        <div className="ak-marquee cp-marquee" aria-label={FEATURES.join(", ")}>
          <div className="ak-marquee-track" aria-hidden>
            {[0, 1].map((copy) => <ul key={copy}>{FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>)}
          </div>
        </div>

        <Principles />

        <section className="cp-overview" aria-labelledby="cp-known">
          <h2 id="cp-known">Connection is feeling <em>known, valued and supported</em></h2>
          <div className="cp-grid">
            {GRID.map((col, c) => (
              <div key={c} className={`cp-col${c === 1 ? " down" : ""}`}>
                {col.map((x) => (
                  <article key={x.title} className="cp-card">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo */}
                    <img src={`/akines/philosophy/${x.img}.jpg`} alt="" loading="lazy" />
                    <h3>{x.title}</h3>
                    <p>{x.body}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </section>

        <Values />

        <section className="cp-close">
          <h2>Akines uses thoughtful technology, shared experiences and relationship intelligence to help people become <em>genuinely known, meaningfully connected and continuously supported.</em></h2>
          <Link href="/login" className="cp-btn cp-btn-lg">Find Your People</Link>
        </section>
      </main>
      <AboutFooter />
    </>
  );
}
