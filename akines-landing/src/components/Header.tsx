'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nav } from '@/content/content';
import { Logo } from './Logo';
import { MenuIcon } from './Icon';
import { Menu } from './Menu';

/** Scroll distance from the bottom of the hero at which the header turns solid. */
const SOLID_OFFSET = 80;
/** Scrolling this many pixels in one direction hides (down) or shows (up) the header. Ignores jitter. */
const TRAVEL = 8;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLElement>(null);
  const openRef = useRef(false);
  // Scroll distance travelled in the current direction (positive is down), and where we last were.
  const travel = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    openRef.current = open;
    if (open) setHidden(false);
  }, [open]);

  // Transparent over the hero, solid ivory once the hero has scrolled past. Slides away while the
  // visitor scrolls down and comes back, fixed to the top, as soon as they scroll up.
  useEffect(() => {
    const hero = document.getElementById('top');
    let frame = 0;
    lastY.current = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const threshold = hero ? hero.offsetHeight - SOLID_OFFSET : 200;
      setScrolled(y > threshold);

      // Clamp to the real scroll range so rubber-banding at either end is not read as a direction.
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const pos = Math.min(Math.max(0, y), max);
      const dy = pos - lastY.current;
      lastY.current = pos;

      const barHeight = bar.current ? bar.current.offsetHeight : 80;
      // Always visible near the top, with the menu open, and while a link glides to a section (the
      // section is placed to sit under the header).
      if (pos <= barHeight || openRef.current || document.documentElement.hasAttribute('data-gliding')) {
        travel.current = 0;
        setHidden(false);
        return;
      }
      if (dy === 0) return;
      if (Math.sign(dy) !== Math.sign(travel.current)) travel.current = 0;
      travel.current += dy;
      if (travel.current > TRAVEL) setHidden(true);
      else if (travel.current < -TRAVEL) setHidden(false);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButton.current?.focus());
  }, []);

  return (
    <>
      <header
        ref={bar}
        className="site-header"
        data-state={scrolled ? 'solid' : 'clear'}
        data-hidden={hidden ? 'true' : 'false'}
        onFocus={() => {
          // Keyboard users who tab or shift-tab into the header always get to see it.
          travel.current = 0;
          setHidden(false);
        }}
      >
        <div className="site-header__inner">
          <div className="site-header__left">
            <button
              ref={menuButton}
              type="button"
              className="icon-btn"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="icon-btn__glyph" />
            </button>
          </div>

          <a className="site-header__logo" href="#top" aria-label="Akines, back to top">
            <Logo />
          </a>

          <nav className="site-header__right" aria-label="Account">
            <a className="site-header__signin" href={nav.signIn.href}>
              {nav.signIn.label}
            </a>
            <a className="btn btn--header" href={nav.join.href}>
              <span>{nav.join.label}</span>
            </a>
          </nav>
        </div>
      </header>

      {open ? <Menu onClose={closeMenu} /> : null}
    </>
  );
}
