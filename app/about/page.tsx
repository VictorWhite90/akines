import Link from "next/link";

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

      <main className="ak-body" />
    </>
  );
}
