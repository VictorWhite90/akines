/**
 * Every destination used by a button or link on the About page lives here, so product can change
 * them without touching components. The landing build pointed every call to action at a 404 page
 * until its destination existed; inside the app the destinations exist, so they are wired here.
 * Items marked TODO still need a confirmed destination.
 */

export const LINKS = {
  /** Sign in (header, menu, footer). */
  signIn: '/login',
  /** Join Akines and the primary "Find my kind of connection" CTAs. */
  join: '/signup',
  /** Long-form philosophy page ("Explore the Akines philosophy", "Understand our approach"). */
  philosophy: '/about/philosophy',
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
