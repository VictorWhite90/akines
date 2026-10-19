import Link from "next/link";

/** Section links point at the About page, so they also work from /about/philosophy. */
const NAV = [
  { href: "/about#how-it-works", label: "How it Works" },
  { href: "/about/philosophy", label: "Core Philosophy" },
  { href: "/about#experiences", label: "Experiences" },
  { href: "/about#matching", label: "Matching" },
  { href: "/about#wellbeing", label: "Wellbeing" },
];

const FOOTER = [
  { title: "Connect", links: [{ label: "KinCircles", href: "/login" }, { label: "Banter", href: "/login" }, { label: "Introduction", href: "/login" }] },
  { title: "Create", links: [{ label: "Collaboration Studio", href: "/login" }, { label: "Play Together", href: "/login" }, { label: "My Store", href: "/login" }] },
  { title: "Trust", links: [{ label: "Wellbeing", href: "/about#wellbeing" }, { label: "Safety", href: "/about#wellbeing" }, { label: "Privacy", href: "/about#wellbeing" }] },
];

export function AboutHeader() {
  return (
      <header className="ak-nav">
        <div className="ak-wrap ak-nav-in">
          <Link href="/about" className="ak-brand" aria-label="Akines home">
            <img src="/akines/mark.svg" alt="" width={32} height={32} />
            <span>AKINES</span>
          </Link>
          <nav className="ak-links" aria-label="About Akines">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </nav>
          <Link href="/login" className="ak-btn ak-btn-m">Find Your People</Link>
        </div>
      </header>
  );
}

export function AboutFooter() {
  return (
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
  );
}
