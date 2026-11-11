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

// Next's own hydration scripts are inline, hence 'unsafe-inline' for scripts; everything else is locked to our origin.
// Images and media come from S3/CDN and the sample-content CDNs, so any https source is allowed for those only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${liveOrigin()}${production ? "" : " ws: http://localhost:*"}`.trim(),
  "frame-src 'none'",
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
      // API answers are per member: never stored by a browser or proxy cache.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  // The older Collaborate pages, now the design's: open calls are projects, applications are contributions.
  async redirects() {
    return [
      { source: "/applications", destination: "/collaborate/contributions", permanent: false },
      { source: "/collaborate/applications", destination: "/collaborate/contributions", permanent: false },
      { source: "/collaborate/review/:id*", destination: "/collaborate/my-projects", permanent: false },
      { source: "/collaborate/new", destination: "/collaborate/start", permanent: false },
      // The old About page and its philosophy page: the design's landing page tells that story now.
      { source: "/about", destination: "/landing", permanent: false },
      { source: "/about/philosophy", destination: "/landing", permanent: false },
      { source: "/collaborate/calls/:id/apply", destination: "/collaborate/projects/:id/interest", permanent: false },
      { source: "/collaborate/calls/:id", destination: "/collaborate/projects/:id", permanent: false },
    ];
  },
  // Development only: locally stored uploads (/media/...) live on the Django server. Production photos are S3 URLs,
  // so production has no rewrite to the API at all.
  async rewrites() {
    if (production) return [];
    const origin = (process.env.AKINES_API_URL ?? "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
    return [{ source: "/media/:path*", destination: `${origin}/media/:path*` }];
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    deviceSizes: [390, 640, 828, 1080, 1440, 1920],
    imageSizes: [48, 96, 160, 256, 384],
  },
};

export default nextConfig;
