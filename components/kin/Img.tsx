"use client";

import { useState, type CSSProperties, type ImgHTMLAttributes } from "react";
import { preload } from "react-dom";
import { resolveImage, type ImageInput } from "@/lib/images";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "width" | "height"> & {
  /** A path under public/, a full URL, or an API image ({ url, width, height, variants, placeholder }). */
  src: ImageInput;
  /** How wide the image is drawn, as for <img sizes> ("40px", "(max-width: 760px) 100vw, 33vw"). Required: it picks the file. */
  sizes: string;
  /** The page's main (LCP) image: loaded first, eagerly, with high priority and a preload in <head>. */
  priority?: boolean;
  /** Fills its positioned parent, like next/image's `fill`. */
  fill?: boolean;
  width?: number;
  height?: number;
};

/** Fixed sizes at or below this share one file (see `sizes` below). */
const SMALL = 64;

const FILL: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

/**
 * Every photo in the app. Our own photos come as AVIF/WebP at several widths (scripts/images.mjs) and the browser
 * picks the smallest that is sharp at `sizes`; member uploads use the API's variants when it sends them, and the
 * single URL when not. Lazy and async by default; the intrinsic proportions are set so nothing shifts while it loads,
 * and a placeholder colour shows until it arrives. The <picture> wrapper is `display: contents`, so the <img> keeps its
 * classes, layout and object-fit exactly as before.
 */
export default function Img({ src, sizes: given, priority = false, fill = false, width, height, loading, decoding, fetchPriority, style, alt = "", onError, ...rest }: Props) {
  const [failed, setFailed] = useState<string | null>(null);
  const img = resolveImage(src);
  // Small faces (a fixed size up to 64px) all ask for the 64px file: the same person at 24, 32 or 56px is then one
  // download, cached once, instead of one per size.
  const px = /^(\d+(?:\.\d+)?)px$/.exec(given.trim());
  const sizes = px && Number(px[1]) <= SMALL ? `${SMALL}px` : given;
  if (!img) return null;
  const broken = failed === img.original;
  const hasVariants = !broken && Boolean(img.avif || img.webp || img.jpg);

  if (priority && hasVariants) {
    const best = img.avif ?? img.webp ?? img.jpg;
    preload(img.src, { as: "image", imageSrcSet: best, imageSizes: sizes, fetchPriority: "high", type: img.avif ? "image/avif" : img.webp ? "image/webp" : undefined });
  }

  const own = width != null || height != null;
  // The photo's own proportions hold its space before it loads (as width/height attributes would, without
  // fixing a height where the CSS only limits the width).
  const ratio = !own && !fill && img.width && img.height ? `auto ${img.width} / ${img.height}` : undefined;
  const placeholder = img.placeholder && !broken
    ? img.placeholder.startsWith("data:")
      ? { backgroundImage: `url("${img.placeholder}")`, backgroundSize: "cover", backgroundPosition: style?.objectPosition ?? "center" }
      : { backgroundColor: img.placeholder }
    : undefined;
  const tag = (
    // eslint-disable-next-line @next/next/no-img-element -- this is the app's image component
    <img
      {...rest}
      alt={alt}
      src={broken ? img.original : img.src}
      srcSet={hasVariants ? img.jpg : undefined}
      sizes={hasVariants ? sizes : undefined}
      width={own ? width : undefined}
      height={own ? height : undefined}
      loading={priority ? "eager" : loading ?? "lazy"}
      decoding={decoding ?? (priority ? "sync" : "async")}
      fetchPriority={priority ? "high" : fetchPriority}
      style={{ ...placeholder, ...(ratio ? { aspectRatio: ratio } : null), ...(fill ? FILL : null), ...style }}
      onError={(e) => {
        if (!broken && img.src !== img.original) setFailed(img.original);
        onError?.(e);
      }}
    />
  );
  if (!hasVariants || (!img.avif && !img.webp)) return tag;
  return (
    <picture style={{ display: "contents" }}>
      {img.avif ? <source type="image/avif" srcSet={img.avif} sizes={sizes} /> : null}
      {img.webp ? <source type="image/webp" srcSet={img.webp} sizes={sizes} /> : null}
      {tag}
    </picture>
  );
}
