# Akines motion kit

Everything that makes the landing page feel the way it does, pulled out of the page so it can be reused
anywhere. It is plain CSS and plain DOM code with two tiny React helpers; nothing depends on a page's
layout. The live copies these files were taken from are in `app/(landing)/styles`, `lib/landing` and
`components/landing`.

## The idea in one paragraph

Things arrive, they are never already there. Text rises 28px and fades in over about a second with a
long soft landing. Photographs open downwards behind an ivory curtain while the picture settles from a
slight zoom. Neighbours that arrive together start 100ms apart so they overlap instead of queueing.
Buttons fill from below on hover and press down on click. Only one thing ever loops: the loader in the
trust carousel. Three easing curves do all of it.

| Curve | Value | Used for |
| --- | --- | --- |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | anything arriving: reveals, hover sweeps, the header returning |
| `--ease-io` | cubic-bezier(0.76, 0, 0.24, 1) | masks that open or close: the curtain, the header leaving, the sheet |
| `--ease` | cubic-bezier(0.4, 0, 0.2, 1) | state changes: colour, size, opacity, the stepper rows |

## Files

| File | What it holds |
| --- | --- |
| `tokens.css` | the three easing curves |
| `head-script.js` | inline in `<head>`: adds `js` and `hero-ready` to `<html>` so start states are only hidden when script will reveal them |
| `motion.ts` | the engine: tags elements with `data-reveal`, watches them with an IntersectionObserver, sets `--rd` stagger delays, splits headline words, the hero scroll scrub (`--hp`), eased anchor scrolling (`scrollToId`) |
| `motion.css` | every keyframe and start state the engine styles, plus hover zooms, stepper and chip transitions, the menu entrance and exit, the mobile swipe card, print and reduced-motion rules |
| `Motion.tsx` | React: mounts the engine once (`useEffect(() => initMotion(), [])`) |
| `Lines.tsx` | React: soft line breaks that collapse on mobile, and `words` mode that wraps each word for the hero cascade |
| `interactions.css` | the button system (rising fill, colour swap, press to 0.97, arrow nudge), the discovery link whose underline redraws, round icon buttons, underline-on-hover text links |
| `header-hide.css` + `useHideOnScroll.ts` | the header that slides away on scroll down and returns on scroll up |
| `menu.css` | the menu entrance; the exit and the link cascade are in `motion.css` |
| `carousel.css` | the trust stage: crossfading photo and copy, chips with a linear loader that drives auto-advance |
| `stepper.css` | the how-it-works rows expanding, the photo crossfade, the mobile card's height easing |

## Timings

| Moment | Duration | Delay | Curve |
| --- | --- | --- | --- |
| Hero photo settles (scale 1.14 to 1) | 2.4s | on `hero-ready` | ease-out |
| Hero header items | 1.1s | 0.35s, 0.47s, 0.59s | ease-out |
| Hero eyebrow | 1.1s | 0.15s | ease-out |
| Hero headline words | 1.1s | 0.3s + 50ms per word | ease-out |
| Hero buttons | 1.1s | 0.8s, 0.92s | ease-out |
| Text reveal (`data-reveal="up"`) | 1.1s | `--rd`: 100ms per neighbour, max 8 | ease-out |
| Headline words (`data-reveal="words"`) | 1.1s | `--rd` + 55ms per word | ease-out |
| Photo curtain (`data-reveal="frame"`) | 1.5s | 0 | ease-io |
| Photo settle behind the curtain | 2.2s | 0 | ease-out |
| Photo hover zoom | 1.6s | | ease-out |
| Button fill on hover | 0.55s | | ease-out |
| Button press | 0.35s to scale 0.97 | | ease-out |
| Link underline redraw | 0.8s | | ease-out |
| Header hides | 0.45s | | ease-io |
| Header returns | 0.6s | | ease-out |
| Menu backdrop in | 0.5s | | ease-out |
| Menu panel in | 0.7s | | ease-out |
| Menu links | 0.9s | 0.2s + 70ms each | ease-out |
| Menu exit | 0.28s | | ease-in |
| Stepper row expands | 0.55s | | ease-out |
| Stepper photo crossfade | 0.5s | | ease |
| Mobile card text in | 1s | 0.06s + 55ms per line | ease-out |
| Mobile card text out | 0.3s | 40ms per line | ease-out |
| Mobile card height | 0.6s | | ease-out |
| Carousel photo and copy crossfade | 0.6s and 0.5s | | ease |
| Carousel chip loader | the step length (12s on About), linear | | |
| Eased anchor scroll | min(1500, 650 + distance × 0.11) ms | | easeInOutCubic |

## Drop it into a page

1. Load `tokens.css`, `interactions.css` and `motion.css` after your own styles. Add `header-hide.css`,
   `menu.css`, `carousel.css` or `stepper.css` only where you use that pattern.
2. Inline `head-script.js` in `<head>`. Give the hero image the class `hero__img`.
3. Mount `<Motion />` once at the end of the page. It calls `initMotion()` and cleans up on unmount.
4. Add your selectors to the three lists at the top of `motion.ts`: `UP` for text blocks that rise,
   `WORDS` for headlines whose words cascade, `FRAME` for photographs and full-bleed sections. That is
   the only wiring. The engine groups elements by their closest `section` or `footer`, so the stagger
   count restarts per section.
5. For the hero cascade, render the headline through `<Lines text={...} words />` and give the hero the
   id `top`; `--hp` (0 to 1) is then set on it as it scrolls out.
6. For the header, call `useHideOnScroll(menuOpen)` and put `ref={barRef}`,
   `data-hidden={hidden ? "true" : "false"}` and `onFocus={reveal}` on the fixed header.
7. For in-page links, use `href="#section-id"`; the engine intercepts clicks and glides there. Sections
   get `scroll-margin-top` equal to the header height so they land beneath it.

## The menu exit pattern

The menu unmounts only after its exit animation. In React: keep a `closing` state, set
`data-closing` on the menu root, wait `EXIT_MS` (280) with a timeout, then call `onClose`. With reduced
motion skip the wait. When a menu link targets a section, close first and run `scrollToId` in the
`after` callback so the page glides once the scroll lock is released.

## The carousel pattern

Each chip holds a `.chip__loader` whose `animation-duration` is the step length. Listen for
`animationend` on the active loader and advance. Because the loader is the clock, pausing is just
`animation-play-state: paused`, which `carousel.css` applies for keyboard focus and `.is-paused`.
Hover does not pause it, by decision. Reduced motion removes the loader, so nothing auto-advances.

## Rules that keep it safe

- Hidden start states exist only under `html.js` and `prefers-reduced-motion: no-preference`. Without
  script, with reduced motion, and when printing, everything is visible and the layout is identical.
- The engine sets only data attributes and CSS variables, never classes, so React re-renders cannot undo it.
- Individual transform properties (`scale`, `translate`) are used so reveal, hover and scroll effects
  compose instead of fighting over `transform`.
- Reveal animations use `animation-fill-mode: backwards`, so elements return to their natural state.
- Hover effects live inside `@media (hover: hover)`.
- The curtain reveal is a pseudo-element, not `clip-path`, because Chrome's IntersectionObserver treats
  content under an ancestor clip-path as not intersecting.
- Nothing bounces past its rest position, and nothing loops except the carousel loader.
