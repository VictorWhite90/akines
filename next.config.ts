import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Django API mixes paths with and without a trailing slash (auth/register, profile/), so /api/v1/*
  // must reach the gateway untouched. Page URLs are still normalised, in proxy.ts.
  skipTrailingSlashRedirect: true,
  // app/global-not-found.tsx: one 404 page across the three root layouts.
  experimental: { globalNotFound: true },
  // Development: locally stored uploads (/media/...) live on the Django server. Production photos are S3 URLs.
  // The older Collaborate pages, now the design's: open calls are projects, applications are contributions.
  async redirects() {
    return [
      { source: "/applications", destination: "/collaborate/contributions", permanent: false },
      { source: "/collaborate/applications", destination: "/collaborate/contributions", permanent: false },
      { source: "/collaborate/review/:id*", destination: "/collaborate/my-projects", permanent: false },
      { source: "/collaborate/new", destination: "/collaborate/start", permanent: false },
      { source: "/collaborate/calls/:id/apply", destination: "/collaborate/projects/:id/interest", permanent: false },
      { source: "/collaborate/calls/:id", destination: "/collaborate/projects/:id", permanent: false },
    ];
  },
  async rewrites() {
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
