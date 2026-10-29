/**
 * Every destination used by a button or link on the landing page lives here,
 * so product can change them without touching components.
 *
 * Every call to action (sign in, join, "Find my kind of connection", the experience cards and the
 * philosophy links) currently points at the 404 page (src/app/not-found.tsx) until its real
 * destination exists. To go live, replace NOT_FOUND below with the real URL for that entry.
 * Items marked TODO still need a confirmed destination.
 */
export const NOT_FOUND = '/404';

export const LINKS = {
  /** Sign in (header, menu, footer). TODO: confirm the sign-in route. */
  signIn: NOT_FOUND,
  /** Join Akines and the primary "Find my kind of connection" CTAs. TODO: confirm the sign-up route. */
  join: NOT_FOUND,
  /** Long-form philosophy page ("Explore the Akines philosophy", "Understand our approach"). */
  philosophy: NOT_FOUND,
  /** Contact. TODO: replace with a mailto: or contact page. Scrolls to the footer for now. */
  contact: '#contact',
  /** Legal and trust pages. TODO: none of these routes exist yet. */
  privacy: '#',
  terms: '#',
  accessibility: '#',
  guidelines: '#',
  safety: '#trust',
} as const;

/** In-page anchors. Section ids are set in the section components. */
export const ANCHORS = {
  top: '#top',
  intention: '#intention',
  philosophy: '#philosophy',
  howItWorks: '#how-it-works',
  experiences: '#experiences',
  trust: '#trust',
  community: '#community',
  contact: '#contact',
} as const;
