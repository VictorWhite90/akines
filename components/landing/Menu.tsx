'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nav } from '@/lib/landing/content';
import { scrollToId } from '@/lib/landing/motion';
import { ChevronRightIcon, CloseIcon } from './Icon';
import { Logo } from './Logo';

type Props = { onClose: (restoreFocus?: boolean) => void };

const MOBILE_QUERY = '(max-width: 767px)';
/** Length of the closing animation in motion.css (menu-fade-out, menu-panel-out). */
const EXIT_MS = 280;

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Navigation menu. From tablet width it is a frosted side panel over a dimmed page; on mobile it
 * is a full-screen modal. Links scroll to sections of the page.
 */
export function Menu({ onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [mobile, setMobile] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const exitTimer = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /**
   * Plays the closing animation, then unmounts. `after` runs once the menu is gone and the scroll lock
   * has been released (used to scroll to a section).
   */
  const requestClose = useCallback(
    (restoreFocus = true, after?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const finish = () => {
        onClose(restoreFocus);
        if (after) window.requestAnimationFrame(after);
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish();
        return;
      }
      setClosing(true);
      exitTimer.current = window.setTimeout(finish, EXIT_MS);
    },
    [onClose],
  );

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  // Lock page scroll, move focus into the dialog, close on Escape and keep Tab inside.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    const previousGutter = html.style.scrollbarGutter;
    // Keep the scrollbar's space reserved so the page does not shift when scrolling is locked.
    html.style.scrollbarGutter = 'stable';
    html.style.overflow = 'hidden';
    closeBtn.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !root.current) return;
      const items = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      html.style.overflow = previous;
      html.style.scrollbarGutter = previousGutter;
    };
  }, [requestClose]);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) {
      onClose(false);
      return;
    }
    event.preventDefault();
    // The menu closes first, then the page scrolls (eased) to the section.
    requestClose(false, () => scrollToId(href.slice(1), true));
  };

  const links = nav.menuLinks.map((link) => (
    <li key={link.href}>
      <a className="menu__link" href={link.href} onClick={(e) => goTo(e, link.href)}>
        <span className="menu__link-label">{link.label}</span>
        {mobile ? null : <ChevronRightIcon className="menu__chevron" />}
      </a>
    </li>
  ));

  return (
    <div
      ref={root}
      id="site-menu"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-variant={mobile ? 'modal' : 'panel'}
      data-closing={closing ? '' : undefined}
    >
      <div className="menu__backdrop" onClick={() => requestClose()} aria-hidden="true" />

      {mobile ? (
        <div className="menu__sheet">
          <div className="menu__bar">
            <button ref={closeBtn} type="button" className="menu__close" onClick={() => requestClose()} aria-label="Close menu">
              <CloseIcon size={24} />
            </button>
            <Logo />
            <span className="menu__bar-spacer" aria-hidden="true" />
          </div>
          <div className="menu__rule" />
          <nav aria-label="Primary">
            <ul className="menu__links">{links}</ul>
          </nav>
          <div className="menu__actions">
            <a className="btn btn--dark-filled menu__action" href={nav.join.href} onClick={() => onClose(false)}>
              <span>{nav.join.label}</span>
            </a>
            <a className="btn btn--dark-outline menu__action" href={nav.signIn.href} onClick={() => onClose(false)}>
              <span>{nav.signIn.label}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="menu__panel">
          <button ref={closeBtn} type="button" className="menu__close menu__close--labelled" onClick={() => requestClose()}>
            <CloseIcon size={20} />
            <span>Close</span>
          </button>
          <div className="menu__rule" />
          <nav aria-label="Primary">
            <ul className="menu__links">{links}</ul>
          </nav>
          <div className="menu__rule" />
          <div className="menu__brand">
            <Logo />
            <p className="menu__tagline">{nav.tagline}</p>
          </div>
        </div>
      )}
    </div>
  );
}
