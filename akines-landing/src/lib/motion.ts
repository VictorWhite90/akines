/**
 * Motion: scroll reveals, hero scroll scrub and eased anchor scrolling. Plain DOM code, no framework,
 * so the same file also runs in the single-file preview.
 *
 * How reveals work: after the page has loaded, matching elements get `data-reveal` ("up" for text,
 * "frame" for photographs) and the CSS in motion.css hides them. An IntersectionObserver adds
 * `data-in` as they scroll into view, which plays the animation. Nothing is hidden for visitors who
 * prefer reduced motion, and nothing is hidden before this code runs. Only data attributes are used
 * (never classes), so React re-renders cannot undo them.
 */

/**
 * Text blocks: fade and rise. Blocks that come into view together cascade in reading order, each one
 * starting a beat after the previous while it is still moving (see STAGGER_MS).
 */
const UP = [
  '.intro .eyebrow',
  '.intro .lead',
  '.intro .dlink',
  '.immersive .eyebrow',
  '.immersive .lead',
  '.steps > li',
  '.card__viewport',
  '.card__nav',
  '.rhythm__cta',
  '.panel__caption > *',
  '.caption > *',
  '.chips__item',
  '.community__intro > *',
  '.moment',
  '.invitation__headline',
  '.invitation__right > *',
  '.closing__content > :not(.closing__actions)',
  '.closing__actions > *',
  '.footer__brand',
  '.footer__col',
  '.footer__legal',
];

/** Headlines: the words rise one after another. */
const WORDS = ['.h2', '.invitation__headline', '.closing__headline'];

/** Photographs and full-bleed sections: the frame opens downwards while the image settles. */
const FRAME = [
  '.panel__media',
  '.story__media',
  '.fullcard',
  '.immersive',
  '.rhythm__stage',
  '.stage',
  '.community__photo',
  '.closing__photo',
];

/** Gap between neighbours that start together. Each animation lasts about a second, so they overlap. */
const STAGGER_MS = 100;
const STAGGER_MAX = 8;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Wraps each word of a heading in <span class="w" style="--wi:n"> so the words can cascade.
 * Soft line breaks (<br>) and the spaces between words are left alone, so wrapping does not change.
 */
function splitWords(el: HTMLElement) {
  if (el.querySelector('.w')) return;
  let n = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent || '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const word = document.createElement('span');
            word.className = 'w';
            word.style.setProperty('--wi', String(n++));
            word.textContent = part;
            frag.appendChild(word);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
}

/* ---------- Eased scrolling to a section ---------- */

let stopScroll: (() => void) | null = null;
const INTERRUPT = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scrolls to the element with this id, easing in and out. Respects the section's scroll-margin (the
 * fixed header), stops if the visitor scrolls, and jumps straight there for reduced motion.
 * Returns the target, or null if there is no such element.
 */
export function scrollToId(id: string, updateHash = false): HTMLElement | null {
  const target = document.getElementById(id);
  if (!target) return null;
  const html = document.documentElement;

  const destination = () => {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const max = Math.max(0, html.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - margin, max));
  };

  if (stopScroll) stopScroll();
  if (updateHash) {
    try {
      history.pushState(null, '', '#' + id);
    } catch {
      /* ignore: some frames do not allow history changes */
    }
  }

  const start = window.scrollY;
  const distance = Math.abs(destination() - start);
  // The header checks this flag so it stays put while a link takes the visitor to a section.
  const flag = () => html.setAttribute('data-gliding', '');
  const unflag = () => html.removeAttribute('data-gliding');
  if (reducedMotion() || distance < 2) {
    flag();
    window.scrollTo(0, destination());
    window.setTimeout(unflag, 150);
    return target;
  }

  const duration = Math.min(1500, 650 + distance * 0.11);
  const began = performance.now();
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto'; // the CSS smooth scrolling would fight every frame
  let frame = 0;

  flag();
  const finish = () => {
    cancelAnimationFrame(frame);
    // keep the flag for a moment so the header's own scroll handler sees the final position
    window.setTimeout(unflag, 150);
    html.style.scrollBehavior = previous;
    INTERRUPT.forEach((type) => window.removeEventListener(type, finish));
    stopScroll = null;
  };
  const tick = (now: number) => {
    const t = Math.min(1, (now - began) / duration);
    window.scrollTo(0, start + (destination() - start) * easeInOutCubic(t));
    if (t < 1) frame = requestAnimationFrame(tick);
    else finish();
  };

  INTERRUPT.forEach((type) => window.addEventListener(type, finish, { passive: true }));
  stopScroll = finish;
  frame = requestAnimationFrame(tick);
  return target;
}

/* ---------- Page motion ---------- */

export function initMotion({ updateHash = true }: { updateHash?: boolean } = {}): () => void {
  const cleanups: Array<() => void> = [];
  const cleanup = () => cleanups.splice(0).forEach((fn) => fn());

  // Eased scrolling for in-page links (the menu calls scrollToId itself after it has closed)
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link || link.closest('.menu')) return;
    const id = (link.getAttribute('href') || '').slice(1);
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    const target = scrollToId(id, updateHash);
    if (target && link.classList.contains('skip-link')) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  };
  document.addEventListener('click', onClick);
  cleanups.push(() => document.removeEventListener('click', onClick));

  if (reducedMotion() || typeof IntersectionObserver === 'undefined') return cleanup;

  /* Hero: the photo drifts and zooms, the copy lifts away, as the page scrolls. */
  const hero = document.getElementById('top');
  let heroFrame = 0;
  const updateHero = () => {
    heroFrame = 0;
    if (!hero) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
    hero.style.setProperty('--hp', progress.toFixed(3));
  };

  /* Photographs fade in as they finish loading instead of popping in. */
  document
    .querySelectorAll<HTMLImageElement>('img.cover:not(.rhythm__image):not(.stage__image)')
    .forEach((img) => {
      if (img.complete || img.getBoundingClientRect().top < window.innerHeight) return;
      img.setAttribute('data-loading', '');
      const done = () => img.removeAttribute('data-loading');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });

  /* Scroll reveals */
  const pending = new Set<Element>();
  const tag = (selectors: string[], kind: 'up' | 'words' | 'frame') => {
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (el.hasAttribute('data-reveal')) return;
      if (kind === 'words') splitWords(el as HTMLElement);
      el.setAttribute('data-reveal', kind);
    });
  };
  tag(UP, 'up');
  tag(WORDS, 'words');
  tag(FRAME, 'frame');
  document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => pending.add(el));

  const reveal = (el: Element, index: number) => {
    if (!pending.delete(el)) return;
    observer.unobserve(el);
    const delay = el.getAttribute('data-reveal') === 'frame' ? 0 : Math.min(index, STAGGER_MAX) * STAGGER_MS;
    (el as HTMLElement).style.setProperty('--rd', delay + 'ms');
    el.setAttribute('data-in', '');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // Elements that arrive together cascade in reading order. The count restarts for each section,
      // so the footer columns, for instance, do not wait behind the closing call to action.
      const placed = new Map<Element, number>();
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .forEach((entry) => {
          const group = entry.target.closest('section, footer') || document.body;
          const index = placed.get(group) || 0;
          placed.set(group, index + 1);
          reveal(entry.target, index);
        });
    },
    { rootMargin: '0px 0px -9% 0px', threshold: 0 },
  );
  pending.forEach((el) => observer.observe(el));
  cleanups.push(() => observer.disconnect());

  // Anything scrolled past without being seen (a jump to a link, a fast flick) is shown as it is passed.
  let sweepTimer = 0;
  const sweep = () => {
    pending.forEach((el) => {
      if (el.getBoundingClientRect().bottom < 0) reveal(el, 0);
    });
  };
  sweep();

  const onScroll = () => {
    if (!heroFrame) heroFrame = requestAnimationFrame(updateHero);
    window.clearTimeout(sweepTimer);
    sweepTimer = window.setTimeout(sweep, 120);
  };
  updateHero();
  window.addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(sweepTimer);
    if (heroFrame) cancelAnimationFrame(heroFrame);
  });

  return cleanup;
}
