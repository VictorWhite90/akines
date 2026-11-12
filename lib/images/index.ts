import manifest from "./manifest.json";

/**
 * Every image the app shows goes through here: our own photos (public/**, processed by scripts/images.mjs into
 * public/_img) and member uploads from the API. components/kin/Img.tsx renders the result.
 */

/** One width of a server-made image (member uploads). Each format is a full URL. */
export type ImageVariant = { width: number; avif?: string; webp?: string; jpg?: string };

/**
 * An image as the API sends it (profile photos, covers, post and chat images). Only `url` is required: without
 * `variants` the original is shown. `placeholder` is a CSS colour ("#a5998e") or a tiny `data:` image.
 */
export type ImageSource = { url: string; width?: number | null; height?: number | null; variants?: ImageVariant[] | null; placeholder?: string | null };

/** What call sites pass: a path under public/, a full URL, an API image, or nothing. */
export type ImageInput = string | ImageSource | null | undefined;

export type ResolvedImage = {
  /** The fallback <img src> (a JPEG/PNG, or the original). */
  src: string;
  /** The original address, used if a variant fails to load. */
  original: string;
  width?: number;
  height?: number;
  avif?: string;
  webp?: string;
  /** A JPEG/PNG srcset for server variants that only come as JPEG. */
  jpg?: string;
  placeholder?: string;
};

/** [width, height, hash, placeholder colour, widths, fallback extension, fallback width] */
type Entry = [number, number, string, string, number[], string, number];
const MANIFEST = manifest as unknown as Record<string, Entry>;

/** Where the hashed variants are served (public/_img, cached for a year: next.config.ts). */
export const VARIANT_BASE = "/_img/";

const variantUrl = (hash: string, width: number, ext: string) => `${VARIANT_BASE}${hash}-${width}.${ext}`;

/** Our own photo's entry, by its public path. Query strings and hashes are ignored. */
function local(src: string): Entry | undefined {
  if (!src.startsWith("/")) return undefined;
  return MANIFEST[src.split(/[?#]/)[0]!];
}

function srcset(list: { width: number; url?: string }[]) {
  const parts = list.filter((v) => v.url).map((v) => `${v.url} ${v.width}w`);
  return parts.length ? parts.join(", ") : undefined;
}

export function resolveImage(input: ImageInput): ResolvedImage | null {
  if (!input) return null;
  if (typeof input === "string") {
    const e = local(input);
    if (!e) return { src: input, original: input };
    const [width, height, hash, colour, widths, fb, fbw] = e;
    return {
      src: variantUrl(hash, fbw, fb),
      original: input,
      width,
      height,
      avif: widths.map((w) => `${variantUrl(hash, w, "avif")} ${w}w`).join(", "),
      webp: widths.map((w) => `${variantUrl(hash, w, "webp")} ${w}w`).join(", "),
      placeholder: colour || undefined,
    };
  }
  if (!input.url) return null;
  // A server image whose url is one of our own photos (sample data) gets our variants.
  const own = local(input.url) ? resolveImage(input.url) : null;
  if (own) return own;
  const variants = [...(input.variants ?? [])].filter((v) => v && v.width > 0).sort((a, b) => a.width - b.width);
  const largestJpg = [...variants].reverse().find((v) => v.jpg)?.jpg;
  return {
    src: largestJpg ?? input.url,
    original: input.url,
    width: input.width ?? undefined,
    height: input.height ?? undefined,
    avif: srcset(variants.map((v) => ({ width: v.width, url: v.avif }))),
    webp: srcset(variants.map((v) => ({ width: v.width, url: v.webp }))),
    jpg: srcset(variants.map((v) => ({ width: v.width, url: v.jpg }))),
    placeholder: input.placeholder ?? undefined,
  };
}

/**
 * A single URL of an image at (at least) `width` pixels, WebP when we have variants. For places that need one
 * address rather than a srcset (next/image's loader, CSS, meta tags).
 */
export function imageUrl(input: ImageInput, width: number): string | undefined {
  if (!input) return undefined;
  const src = typeof input === "string" ? input : input.url;
  const e = local(src);
  if (e) {
    const w = e[4].find((x) => x >= width) ?? e[4].at(-1)!;
    return variantUrl(e[2], w, "webp");
  }
  if (typeof input !== "string" && input.variants?.length) {
    const sorted = [...input.variants].sort((a, b) => a.width - b.width);
    const v = sorted.find((x) => x.width >= width && (x.webp || x.jpg)) ?? [...sorted].reverse().find((x) => x.webp || x.jpg);
    return v?.webp ?? v?.jpg ?? src;
  }
  return src;
}

/**
 * A member photo from the API: the image object (with its variants) when the server sends one beside the plain
 * URL field (profile_photo + profile_photo_image), otherwise the URL.
 */
export const apiPhoto = (url: string | null | undefined, image?: ImageSource | null): ImageInput => (image?.url ? image : url ?? null);

/** The address of an image input, whatever its shape (for keys and comparisons). */
export const imageKey = (input: ImageInput) => (input ? (typeof input === "string" ? input : input.url) : undefined);
