import type { ImageLoaderProps } from "next/image";
import { imageUrl } from "@/lib/images";

/**
 * next/image's loader. The app draws its photos with components/kin/Img (AVIF/WebP srcsets made at build time by
 * scripts/images.mjs); should next/image be used, our own photos map to those same prebuilt WebP files, so no
 * image is ever resized on request. Anything else (a member upload's URL) is used as it is.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return imageUrl(src, width) ?? src;
}
