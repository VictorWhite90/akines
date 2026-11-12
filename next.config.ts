import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";
const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

// Demo mode lets anyone in and saves nothing: a production build with it on would be an open door.
// AKINES_ENV=production is set by the production image build (Dockerfile); preview builds leave it unset.
if (demo && process.env.AKINES_ENV === "production") {
  throw new Error("NEXT_PUBLIC_DEMO_MODE=1 can't be used for a production build (AKINES_ENV=production).");
}
if (production && !demo && process.env.AKINES_ENV === "production" && !process.env.NEXT_PUBLIC_AKINES_LIVE_URL?.startsWith("wss://")) {
  throw new Error("NEXT_PUBLIC_AKINES_LIVE_URL must be the wss:// live chat address for a production build.");
}

/** The live chat origin (wss://api.akines.com), allowed in connect-src. */
function liveOrigin() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_AKINES_LIVE_URL ?? "ws://localhost:8000/ws/v1/live");
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

// Continue with Google: Google Identity Services (lib/google.ts) is allowed only when a client ID is built in.
// Its script, button iframe, styles and calls all live under https://accounts.google.com/gsi/.
const google = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? " https://accounts.google.com/gsi/" : "";

// Next's own hydration scripts are inline, hence 'unsafe-inline' for scripts; everything else is locked to our origin.
// Our own photos are served from this origin (public/_img); member uploads and media come from S3/CDN, so any https
// source is allowed for images and media only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}${google}`,
  `style-src 'self' 'unsafe-inline'${google}`,
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${liveOrigin()}${production ? "" : " ws: http://localhost:*"}${google}`.trim(),
  google ? `frame-src${google}` : "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(production ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/**
 * Pages with a Google button: Google's sign-in popup must be able to hand the credential back to this window, which
 * "same-origin" would cut off (Google documents "same-origin-allow-popups"). Other pages keep "same-origin".
 */
const GOOGLE_PAGES = ["/login", "/signup", "/settings/:path*"];

const nextConfig: NextConfig = {
  // Self-hosted: a small server bundle (server.js + only the node_modules it needs) for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  // The Django API mixes paths with and without a trailing slash (auth/register, profile/), so /api/v1/*
  // must reach the gateway untouched. Page URLs are still normalised, in proxy.ts.
  skipTrailingSlashRedirect: true,
  // app/global-not-found.tsx: one 404 page across the three root layouts.
  experimental: { globalNotFound: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...(google ? GOOGLE_PAGES.map((source) => ({ source, headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }] })) : []),
      // API answers are per member: never stored by a browser or proxy cache.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      // Resized photos (scripts/images.mjs): the file name carries a hash of the photo, so a changed photo gets a new
      // address and these can be kept for a year without asking again.
      { source: "/_img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  async redirects() {
    const to = (source: string, destination: string) => ({ source, destination, permanent: false });
    return [
      // The older Collaborate pages, now the design's: open calls are projects, applications are contributions.
      to("/applications", "/collaborate/contributions"),
      to("/collaborate/applications", "/collaborate/contributions"),
      to("/collaborate/review/:id*", "/collaborate/my-projects"),
      to("/collaborate/new", "/collaborate/start"),
      to("/collaborate/calls/:id/apply", "/collaborate/projects/:id/interest"),
      to("/collaborate/calls/:id", "/collaborate/projects/:id"),
      // Our earlier screens are gone. Their old addresses (bookmarks, shared links, notification links) open the
      // design's page where there is one, and the matching Coming soon page where the design has none yet.
      // Connect
      to("/banter/now/:id", "/community/banter/:id"),
      to("/banter/:path*", "/connect/banter"),
      to("/circles/:path*", "/connect/kincircle"),
      to("/rooms/:path*", "/connect/rooms"),
      to("/activities/:path*", "/connect/activities"),
      to("/kindred", "/connect"),
      to("/cliqs/:path*", "/connect"),
      to("/play/:path*", "/connect"),
      // Make & Sell
      to("/studio/:path*", "/make-sell"),
      to("/studios/me", "/make-sell"),
      to("/journal/:path*", "/make-sell/journal"),
      to("/store/:path*", "/make-sell/store"),
      // Explore
      to("/shop/:path*", "/explore"),
      to("/marketplace/:path*", "/explore"),
      to("/studios/:path*", "/explore/studio-visits"),
      to("/stories/:path*", "/explore/stories"),
      // Care (the three care screens of Community Home, /wellbeing/quiet, /reflect and /support, stay)
      to("/wellbeing", "/care"),
      to("/dna/:path*", "/care/creative-dna"),
      // You
      to("/profile/work", "/profile/complete"),
      to("/profile/:id((?!complete$)[^/]+)", "/connect/people/:id"),
      to("/u/:username*", "/profile"),
      to("/notifications", "/"),
      // Earlier pages and experiments
      to("/about/:path*", "/landing"),
      to("/welcome", "/"),
      to("/community", "/"),
      to("/community/classic", "/"),
      to("/concept", "/"),
      to("/pilot", "/"),
      to("/atelier/:path*", "/"),
      to("/constellation", "/"),
      to("/layouts/:path*", "/"),
      to("/kin-preview/:path*", "/"),
    ];
  },
  // Development only: locally stored uploads (/media/...) live on the Django server. Production photos are S3 URLs,
  // so production has no rewrite to the API at all.
  async rewrites() {
    if (production) return [];
    const origin = (process.env.AKINES_API_URL ?? "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
    return [{ source: "/media/:path*", destination: `${origin}/media/:path*` }];
  },
  // next/image is not used by the app (components/kin/Img draws every photo); the loader maps our photos to the
  // prebuilt variants so it never resizes on request should it be used.
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    deviceSizes: [390, 640, 828, 1080, 1440, 1920],
    imageSizes: [48, 96, 160, 256, 384],
  },
};

export default nextConfig;
