# Akines landing page

Editorial landing page for Akines, built from the Figma design
(https://www.figma.com/design/fUBokQffAL4k4OJCxJy6Bb/Akines). Next.js App Router, TypeScript, plain CSS.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint     # type check (tsc --noEmit)
```

No environment variables are needed.

## Stack

- Next.js 15 (App Router), React 19, TypeScript 5.9
- Plain CSS: design tokens in `src/styles/tokens.css`, one stylesheet per section
- Fonts: Alice (serif) and Manrope (sans) through `@fontsource`
- Icons: `lucide-react`; the logo and the two-line menu glyph are inline SVG
- Images: `next/image` (AVIF and WebP, responsive sizes)

## Breakpoints

| Size | Range | Design width |
| --- | --- | --- |
| Mobile | under 768 | 402 |
| Tablet | 768 to 1279 | 1194 |
| Desktop | 1280 and up | 1512 |

Content is capped at 1512 and centred above that. The full-bleed photo sections (hero, philosophy photo, the
experience cards, the trust stage and the closing photo) are not: they fill the whole screen width at any size and
crop the photo once their height cap is reached (`width: 100%` next to `aspect-ratio` and `max-height`, which
without it would narrow the box and leave it left-aligned on screens wider than about 1700 px). A few components switch at in-between widths so
nothing overflows or wraps awkwardly: trust chips go from two columns to four at 1180, the footer puts
the brand beside the link columns from 1140 and uses its wide column sizes from 1440.

## Where things live

```
src/app/            layout (fonts, metadata), the page, and not-found.tsx (the 404 page)
src/content/        content.ts holds all copy, image paths and data
src/lib/links.ts    every link destination (edit here, not in components)
src/lib/motion.ts   scroll reveals, hero scrub and eased anchor scrolling (plain DOM code)
src/components/     Header, Menu, Hero, Intention, Rhythm, Experiences, Trust, Community, FinalCta, Footer
src/styles/         tokens.css, base.css, one file per section, motion.css (all animation CSS) and notfound.css
public/images/      photography (see below)
```

Soft line breaks in copy are written as `\n` in `content.ts`; the `Lines` component shows them from
tablet width up and hides them on mobile so text reflows naturally.

## Behaviour

- Header: transparent over the hero, solid ivory with a hairline after the hero is scrolled past. It slides up
  out of view when the visitor scrolls down and slides back down, fixed to the top, as soon as they scroll up
  (8 px of travel in one direction is enough, so small wobbles are ignored). It always shows near the top of the
  page, while the menu is open, when keyboard focus moves into it, and while a menu or section link glides to a
  section (so the section lands under it as designed); the next scroll down hides it again. With reduced motion
  it hides and shows at once, with no slide. Logic in `Header.tsx`, the `data-gliding` flag in `motion.ts`,
  the slide in `header.css` (`translate`, 0.45 s to hide, 0.6 s to return). The outlined
  "Join Akines" pill uses the same hover as every other button (rising fill, colour swap, press-down); the fill
  follows the header text colour, so it is white over the hero and ink once the header turns ivory
  (`.btn--header` in `header.css`, shared sweep in `base.css`).
- Menu: frosted side panel from 768 up, full-screen modal on mobile (with Join and Sign in). Links scroll
  to sections, the page behind is scroll locked, focus is trapped, Escape closes and focus returns to
  the menu button.
- How it works: previous and next buttons wrap around, clicking a row opens it, images crossfade. The
  list reserves the height of its tallest state so the page below never jumps.
- How it works on mobile (under 768): the buttons and numbered list are replaced by a card from the Rhythm_Steps
  design: icon badge and title, summary line, description, outlined previous and next buttons around a
  "01 / 05" counter, and the full-width philosophy button. The text swipes with the button tapped: next sends
  the old text out to the left and brings the new text in from the right, previous mirrors it, wrapping from 05
  to 01 and back keeps the direction of the button. The lines cascade 55 ms apart, the card height eases to
  the next slide, and nothing animates until the first tap. With reduced motion the text changes at once.
  All five slides stay in the page (`Rhythm.tsx`, `.card__*` in `rhythm.css`, keyframes in `motion.css`). The
  card is not draggable; only the buttons move it. Tablet and desktop keep the stepper and hide the card.
- Matching and trust: four chips, auto-advance every 12 seconds with a loader inside the active chip
  (`trust.autoAdvanceSeconds` in `content.ts`). Hovering the section does not pause it. It pauses only for
  keyboard focus and with the pause button (which appears on focus), and reduced motion turns auto-advance
  off. From tablet up the headline always sits on two lines: its size follows the width of its column
  (`container-type: inline-size` in `trust.css`) instead of a fixed maximum width, so it stays on two lines
  at every width checked from 768 to 2000. Mobile keeps natural wrapping.
- Everything respects `prefers-reduced-motion`. There is a skip link and visible focus styles.

## Motion

Premium-feel motion is a layer on top of the finished page. Nothing in the components depends on it.

- `src/styles/motion.css` holds every keyframe and start state. `src/lib/motion.ts` finds the elements,
  tags them and watches them with an IntersectionObserver. `src/components/Motion.tsx` starts it once on
  the client. A small inline script in `layout.tsx` adds the `js` class to `<html>` before first paint
  and `hero-ready` once the hero photograph has loaded (or after 4 s).
- Hero: the photograph fades and settles, the header items, eyebrow, headline words and the two buttons
  arrive one after another. While scrolling out, the photograph drifts and zooms and the copy lifts away.
- Scroll reveals: text rises and fades, headlines rise word by word, photographs and full-bleed sections
  open downwards behind an ivory curtain while the image settles. Photographs below the fold fade in as
  they finish loading.
- Staggering: elements that come into view together start 100 ms apart (headline words 55 ms apart,
  hero words 50 ms). Each animation lasts about 1.1 s, so neighbours overlap instead of waiting. The count
  restarts for each section, so the footer columns do not wait behind the closing call to action.
- Interaction: buttons fill with a sweep on hover and press down on click, text links redraw their
  underline, photo cards zoom slowly, chips lift, the stepper and trust stage ease between states, and the
  menu opens and closes with an animation (panel and rules, then links one by one).
- Section links scroll with an eased glide (about 0.65 to 1.5 s depending on distance) that respects the
  fixed header and stops the moment the visitor scrolls, touches or presses a key.
- Reduced motion: with `prefers-reduced-motion: reduce` nothing is tagged, hidden or animated, links jump
  straight to the section and the page looks exactly as it did before the motion layer. Without JavaScript
  and when printing, everything is visible too. Hover effects only apply on devices that can hover.
- To adjust: the selector lists at the top of `motion.ts` (`UP`, `WORDS`, `FRAME`) decide what animates and
  how; `STAGGER_MS` and `STAGGER_MAX` set the cascade; durations and easing live in `motion.css` and the
  `--ease-out` and `--ease-io` tokens in `tokens.css`. New sections need only a selector added to a list.
- Only data attributes (`data-reveal`, `data-in`, `data-loading`) and CSS variables are set on elements, never
  classes, so React re-renders cannot undo them.

## The 404 page

Every call to action (Sign in, Join Akines, "Find my kind of connection", the experience cards, the
philosophy links and the footer sign in and join links) currently leads to `/404`, a designed not found
page, until its real destination exists. Nothing links to the old app login any more.

- `src/lib/links.ts` holds the one `NOT_FOUND` constant and the `signIn`, `join` and `philosophy` entries that
  use it. To make a call to action live, put its real URL in that entry. In-page links (menu, section
  links, "Discover Akines", "Explore Akines") still scroll, and the footer legal links are still `#`.
- `src/app/not-found.tsx` is the page (also shown for any other unknown URL, with HTTP status 404 and
  `noindex`). It has a full-screen photograph (`public/images/notfound.jpg` for tablet and desktop,
  `notfound-portrait.jpg` for mobile, chosen with `<picture>`), a logo link, an "Error 404" label with two
  hairlines, the headline, one sentence of body copy and a Return home button. Copy lives in `content.ts`
  (`notFoundPage`).
- `src/styles/notfound.css` holds the layout and the entrance. On load the photograph fades in and settles
  once it has loaded, then everything arrives one element after another with overlapping delays: logo
  (0.3 s), the two hairlines reaching in toward the label (0.5 s), the label (0.6 s), the headline word by
  word (0.75 s, 60 ms apart), the body (1.3 s) and the button (1.45 s). Each lasts about 1.1 s. The photograph
  then drifts very slowly, and on devices with a mouse it follows the pointer a little
  (`src/components/NotFoundMotion.tsx`).
- Reduced motion: no entrance, no drift, no pointer movement; everything is visible immediately.
- The skip link lives in the landing page (`page.tsx`), not the layout, so the 404 page has no dead skip link.

## Before launch

1. **Links.** Open `src/lib/links.ts`. Sign in, join and the philosophy links point at the 404 page until
   their destinations exist (see "The 404 page"). Privacy, terms, accessibility and community guidelines
   are `#` placeholders because those pages do not exist yet. Contact scrolls to the footer.
2. **Photography.** All images in `public/images` are AI placeholders except the hero photo.
   Replace files with the same name and aspect ratio (see the table below). The community and closing
   photos each exist twice: `community.jpg` and `closing.jpg` are the tighter crops used from tablet up,
   `community-full.jpg` and `closing-full.jpg` are the full frames used on mobile.
3. **Concept previews.** Experiences that are not live yet can be flagged with `concept: true` in
   `content.ts` (the blueprint asks that only real functionality is described as live).
4. **Dependencies.** `npm audit` flags PostCSS inside Next 15. It only runs at build time on this
   repo's own CSS, so it is not reachable from outside; plan the Next 16 upgrade when convenient.
5. **Analytics.** The PRD lists events; none are wired in this build.

| File | Aspect |
| --- | --- |
| `hero.jpg` | 3:2, cropped per breakpoint with `object-position` |
| `connection.jpg`, `continuity.jpg` | 4:5 portrait |
| `conversation.jpg`, `creation.jpg` | 4:3 landscape |
| `immersive.jpg`, `kincircle.jpg`, `mystore.jpg`, `trust-*.jpg` | 16:9 |
| `step-1` to `step-5`, `banter.jpg`, `wellbeing.jpg` | 3:4 portrait |
| `create.jpg` | 4:3 |
| `playtogether.jpg` | 3:2 |
| `notfound.jpg` | 16:9, full screen on tablet and desktop (keep the hands near the centre; the lower third sits under the copy) |
| `notfound-portrait.jpg` | 9:16, full screen on mobile (same composition) |

## Design notes and deviations from Figma

- The hero fills the viewport height (Figma shows a fixed frame).
- The how-it-works list is as tall as its tallest state, about 60 px more than Figma's step 1 frame, to
  stop layout shift.
- Secondary text is `#6E6E6E` (Figma `#6F6F6F` measured 4.46:1 on ivory, this is 4.52:1).
- On mobile the intention panels follow the visual order 01 to 04 using CSS `order`, so keyboard order
  is 01, 03, 02, 04. Content order is a known minor trade-off.
- Hover and focus states were not drawn in Figma; they are simple and consistent (underline, fill
  change, small arrow nudge).

## Checked

- Brightness and layout compared with the Figma frames section by section at 1512, 1194 and 402
  (section heights within about 6 px, apart from the two items above).
- No horizontal overflow from 360 to 2560 px; no console errors.
- White text over photographs measures at least 5.4:1 against the brightest pixel under each text run.
- Scripted checks of the menu, stepper, trust carousel and header state all pass. They include the header
  "Join Akines" hover in both header states, the header hiding and returning on scroll (wheel, keyboard, touch
  width, menu links, reduced motion), the trust headline staying on two lines from 768 to 2000, the
  12 second step length, that hovering does not pause it, and that the pause button still pauses and resumes it.
- Mobile step card: scripted checks cover the layout against the design (section height within 0.1 px), the
  counter, swipe direction for both buttons, wrap-around, the old text leaving while the new arrives, height
  easing, rapid taps, no animation on load, reduced motion, hidden on tablet and desktop, and the reveal after
  resizing the window.
- 404 page: scripted checks cover the 404 status, content and Return home, every call to action opening it
  (desktop header, mobile menu, hero), the entrance order and delays, pointer parallax, reduced motion, no
  overflow from 360 to 1920 px (and a 600 px tall window) and no console errors.
- Full width: a scripted check measures the trust stage, closing photo, philosophy photo section and experience
  cards at 402, 768, 1194, 1280, 1512, 1728, 1920, 2200, 2560 and 3440 px: each spans the full width, no overflow.
- Motion: scripted checks cover the hero sequence, every reveal completing after a slow scroll and after
  a jump, the stagger timings, the eased scroll, the menu exit, mobile overflow and no console warnings.
  With reduced motion the page heights and pixels match the build from before the motion layer.
