import { footer } from '@/lib/landing/content';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer__rule" />
        <div className="footer__main">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">{footer.tagline}</p>
          </div>
          <nav className="footer__columns" aria-label="Footer">
            {footer.columns.map((col) => (
              <div key={col.heading} className="footer__col">
                <h2 className="eyebrow">{col.heading}</h2>
                <ul className="footer__links">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a className="footer__link" href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer__rule" />
        <div className="footer__legal">
          <p className="footer__copy">{footer.legal.copyright}</p>
          <ul className="footer__legal-links">
            {footer.legal.links.map((link) => (
              <li key={link.label}>
                <a className="footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
