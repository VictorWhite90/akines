import type { ImageLoaderProps } from "next/image";

/**
 * Lets Cloudinary resize and pick the format at its edge instead of the Next
 * image optimizer. Several source photos are 5–10 MB, which the optimizer
 * times out on; Cloudinary serves the right width as WebP/AVIF in one hop.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const marker = "/image/upload/";
  if (!src.includes("res.cloudinary.com") || !src.includes(marker)) return src;
  const [base, rest] = src.split(marker);
  return `${base}${marker}f_auto,q_${quality ?? "auto"},c_limit,w_${width}/${rest}`;
}
