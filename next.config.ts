import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Django API mixes paths with and without a trailing slash (auth/register, profile/), so /api/v1/*
  // must reach the gateway untouched. Page URLs are still normalised, in proxy.ts.
  skipTrailingSlashRedirect: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    deviceSizes: [390, 640, 828, 1080, 1440, 1920],
    imageSizes: [48, 96, 160, 256, 384],
  },
};

export default nextConfig;
