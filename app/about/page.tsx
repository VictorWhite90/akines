import Link from "next/link";
import Experiences from "./_components/Experiences";
import MoodCheckin from "./_components/MoodCheckin";
import Rhythm from "./_components/Rhythm";

const NAV = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#philosophy", label: "Core Philosophy" },
  { href: "#experiences", label: "Experiences" },
  { href: "#matching", label: "Matching" },
  { href: "#wellbeing", label: "Wellbeing" },
];

const FOOTER = [
  { title: "Connect", links: [{ label: "KinCircles", href: "/circles" }, { label: "Banter", href: "/banter" }, { label: "Introduction", href: "/kindred" }] },
  { title: "Create", links: [{ label: "Collaboration Studio", href: "/collaborate" }, { label: "Play Together", href: "/play" }, { label: "My Store", href: "/store" }] },
  { title: "Trust", links: [{ label: "Wellbeing", href: "/wellbeing" }, { label: "Safety", href: "/wellbeing" }, { label: "Privacy", href: "#wellbeing" }] },
];

const FEATURES = ["Banter", "Play Together", "Collaboration Studio", "Creative DNA", "My Store", "KinCircles"];

export default function AboutPage() {
  return (
    <>
      <header className="ak-nav">
        <div className="ak-wrap ak-nav-in">
          <Link href="/about" className="ak-brand" aria-label="Akines home">
            <img src="/akines/mark.svg" alt="" width={32} height={32} />
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

        {/* Core philosophy (Figma: About / Core Philosophy Section) */}
        <section className="ak-philo" aria-labelledby="philo-title">
          <div className="ak-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo */}
            <img className="ak-philo-img" src="/akines/philosophy.jpg" alt="Four friends laughing together outdoors, holding sparklers" width={1320} height={560} loading="lazy" />
            <div className="ak-philo-grid">
              <div className="ak-philo-left">
                <h2 id="philo-title">Our Core Philosophy</h2>
                <p>Human connection is not the number of people we know. It is the degree to which we feel known, valued and supported.</p>
                <a href="#how-it-works" className="ak-philo-more">Read More <span aria-hidden>→</span></a>
              </div>
              <div className="ak-philo-right">
                <p className="ak-philo-lead">Technology should not merely connect people digitally; it should help people form, deepen and sustain relationships that matter in real life.</p>
                <p>Most social platforms connect profiles, distribute content and reward visibility. Akines connects human beings around their intentions, needs, values, experiences and capacity to support one another.</p>
                <p>Its purpose is not to make people spend more time online. It is to help them experience more belonging, companionship, collaboration and mutual care, online and offline.</p>
                <ul className="ak-philo-tags">
                  {["Belonging", "Companionship", "Collaboration", "Mutual care"].map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
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
              <Link href="/dna" className="ak-btn ak-btn-xl ak-cta-xl">Build My Creative DNA</Link>
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

        <section className="ak-wellness" id="wellbeing">
          <div className="ak-wrap">
            <header className="ak-wellness-head">
              <p className="ak-label">Private by design</p>
              <h2>Connection includes how you feel.</h2>
            </header>
            <div className="ak-wellness-cards">
              <article className="ak-wcard ak-wcard-checkin">
                <div className="ak-wcard-top">
                  <p className="ak-wcard-eyebrow">Your private check-in</p>
                  <h3>How are you arriving today?</h3>
                </div>
                <MoodCheckin />
              </article>
              <article className="ak-wcard ak-wcard-ai">
                <div className="ak-wcard-top">
                  <p className="ak-wcard-eyebrow">Responsible AI</p>
                  <div className="ak-wcard-intro">
                    <h3>Support, without pretending to diagnose.</h3>
                    <p>
                      Akines can help you reflect on loneliness, burnout or creative blocks. When more support may help,
                      it connects you with qualified people and trusted resources.
                    </p>
                  </div>
                </div>
                <Link href="/wellbeing" className="ak-btn ak-btn-xl ak-cta-xl ak-btn-dark">Explore Wellbeing Support</Link>
              </article>
            </div>
          </div>
        </section>

        <section className="ak-final">
          <img className="ak-final-bg" src="/akines/find-your-people.jpg" alt="" width={1216} height={832} loading="lazy" />
          <div className="ak-final-blur" aria-hidden>
            <span /><span /><span /><span />
          </div>
          <div className="ak-final-shade" aria-hidden />
          <div className="ak-wrap ak-final-in">
            <h2>Find your people.<br />Make something real.</h2>
            <p>Join the early Akines community and help shape a healthier way to connect.</p>
            <Link href="/signup" className="ak-btn ak-btn-xl ak-cta-xl">Find Your People</Link>
          </div>
        </section>
      </main>

      <footer className="ak-footer">
        <div className="ak-footer-in">
          <div className="ak-footer-brand">
            <Link href="/about" className="ak-brand" aria-label="Akines home">
              <img src="/akines/mark.svg" alt="" width={32} height={32} />
              <span>AKINES</span>
            </Link>
            <p>Relationship intelligence for a less lonely, more creative world.</p>
          </div>
          <nav className="ak-footer-nav" aria-label="Footer">
            {FOOTER.map((col) => (
              <div key={col.title} className="ak-footer-col">
                <h3>{col.title}</h3>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="ak-copyright">© 2026 Akines. Human connection, thoughtfully designed.</p>
      </footer>
    </>
  );
}
