import type { ImageLoaderProps } from "next/image";

/**
 * Every photo is resized at the source's own CDN edge, in a modern format, at the width the
 * screen actually needs. That keeps images small and fast, like a social feed.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality ?? 62;
  if (src.startsWith("https://images.unsplash.com/")) return `${src}?w=${width}&q=${q}&auto=format&fit=crop`;
  if (src.startsWith("https://a.storyblok.com/")) return `${src}/m/${width}x0/filters:quality(${q}):format(webp)`;
  if (src.startsWith("https://artlogic-res.cloudinary.com/")) return src.replace(/\/w_\d+[^/]*\//, `/w_${width},c_limit,f_auto,q_auto/`);
  return src;
}
