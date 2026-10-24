/**
 * Demo mode: the whole app runs on sample data in the browser, with no backend.
 * For UI previews (e.g. a Vercel preview for reviewers) while the API is being built.
 *
 * Turned on at build time with NEXT_PUBLIC_DEMO_MODE=1. Never set it on production: anyone can sign in,
 * and nothing anyone does is saved to Akines.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

/** The readable cookie the demo uses as "signed in" (the real app uses HttpOnly cookies set by our server). */
export const DEMO_COOKIE = "ak_in";
