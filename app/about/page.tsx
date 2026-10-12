import Link from "next/link";
import Experiences from "./_components/Experiences";
import Rhythm from "./_components/Rhythm";

const NAV = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#philosophy", label: "Core Philosophy" },
  { href: "#experiences", label: "Experiences" },
  { href: "#matching", label: "Matching" },
  { href: "#wellbeing", label: "Wellbeing" },
];

const FEATURES = ["Banter", "Play Together", "Collaboration Studio", "Creative DNA", "My Store", "KinCircles"];

export default function AboutPage() {
  return (
    <>
      <header className="ak-nav">
        <div className="ak-wrap ak-nav-in">
          <Link href="/about" className="ak-brand" aria-label="Akines home">
            <img src="/akines/mark.png" alt="" width={32} height={32} />
            <span>AKINES</span>
          </Link>
          <nav className="ak-links" aria-label="About Akines">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </nav>
          <Link href="/signup" className="ak-btn ak-btn-m">Find Your People</Link>
        </div>
      </header>

      <section className="ak-hero">
        <video className="ak-hero-video" src="/akines/hero.mp4" poster="/akines/hero-poster.jpg" autoPlay muted loop playsInline aria-hidden />
        <div className="ak-hero-shade" aria-hidden />
        <div className="ak-hero-content">
          <p className="ak-eyebrow">Building better human connections</p>
          <h1>Less scrolling.<br />More belonging.</h1>
          <p className="ak-lede">
            Akines helps you meet people who share more than interests—people who can become collaborators,
            confidants and a genuine part of your life.
          </p>
          <div className="ak-ctas">
            <Link href="/dna" className="ak-btn ak-btn-xl">Discover my Creative DNA</Link>
            <a href="#how-it-works" className="ak-btn ak-btn-xl ak-btn-outline">See How it Works</a>
          </div>
        </div>
      </section>

      <div className="ak-marquee" aria-label={FEATURES.join(", ")}>
        <div className="ak-marquee-track" aria-hidden>
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
          ))}
        </div>
      </div>

      <main>
        <section className="ak-quote" id="philosophy">
          <div className="ak-wrap ak-quote-in">
            <p className="ak-label">Not another social network</p>
            <blockquote>
              Most platforms help you collect an audience. Akines helps you <em>build a relationship</em>—then gives
              that relationship somewhere to grow.
            </blockquote>
          </div>
        </section>

        <section className="ak-rhythm" id="how-it-works">
          <div className="ak-wrap">
            <header className="ak-rhythm-head">
              <p className="ak-label">The Akines rhythm</p>
              <div className="ak-rhythm-intro">
                <h2>Every gathering has a purpose.</h2>
                <p>
                  There is no endless feed and no pressure to perform. Each experience moves people from first contact
                  to something worth continuing.
                </p>
              </div>
            </header>
            <Rhythm />
          </div>
        </section>

        <section className="ak-features" id="experiences">
          <div className="ak-wrap">
            <header className="ak-features-head">
              <p className="ak-label">Choose what feels natural</p>
              <h2>Connection through doing.</h2>
            </header>
            <Experiences />
          </div>
        </section>

        <section className="ak-matching" id="matching">
          <div className="ak-wrap ak-matching-in">
            <div className="ak-matching-copy">
              <p className="ak-label">Meaningful matching</p>
              <div className="ak-matching-intro">
                <h2>Meet for a reason, not an algorithm.</h2>
                <p>
                  Your Creative DNA reflects how you create, communicate and connect. Akines uses it to explain why an
                  introduction may matter—then leaves the choice with you.
                </p>
              </div>
              <Link href="/dna" className="ak-btn ak-btn-xl">Build My Creative DNA</Link>
            </div>
            <img
              className="ak-matching-photo"
              src="/akines/people-together.jpg"
              alt="Four friends sharing drinks and taking a selfie together outdoors"
              width={1500}
              height={1000}
              loading="lazy"
            />
          </div>
        </section>
      </main>
    </>
  );
}
