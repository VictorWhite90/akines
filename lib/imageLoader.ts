import type { ImageLoaderProps } from "next/image";

/**
 * Unsplash resizes and picks the format at its own edge, so we skip the Next
 * image optimizer and just ask for the width we need.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  return `${src}?w=${width}&q=${quality ?? 70}&auto=format&fit=crop`;
}
