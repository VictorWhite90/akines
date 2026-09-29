import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    deviceSizes: [390, 640, 828, 1080, 1440, 1920],
    imageSizes: [48, 96, 160, 256, 384],
  },
};

export default nextConfig;
