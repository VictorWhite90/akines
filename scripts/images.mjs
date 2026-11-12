#!/usr/bin/env node
/**
 * Build-time image pipeline. Every photo under the folders in SOURCES is turned into responsive variants
 * (AVIF + WebP at the widths below, never upscaled, plus one JPEG/PNG fallback), written to public/_img with
 * content-hashed names so they can be cached forever, and described in lib/images/manifest.json
 * (src -> intrinsic size, placeholder colour, available widths). components/kin/Img.tsx reads the manifest.
 *
 *   node scripts/images.mjs          build what is missing (fast when nothing changed), drop stale variants
 *   node scripts/images.mjs --force  rebuild every variant
 *
 * Runs before `next dev` and `next build` (package.json predev/prebuild). The variants are not committed
 * (public/_img is in .gitignore); the manifest is, so type checks and lint work on a fresh clone. A source
 * missing from the manifest simply falls back to its original file.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, "_img");
const MANIFEST = path.join(ROOT, "lib/images/manifest.json");

/** Folders (and single files) under public/ whose photos are processed. */
const SOURCES = ["kin", "landing", "akines", "kincirclebg.jpg"];
const EXT = /\.(jpe?g|png|webp)$/i;
/** Responsive widths in CSS pixels x DPR. The source's own width is added when it is smaller than the largest. */
const WIDTHS = [64, 128, 256, 384, 640, 960, 1280, 1920];
/** The single fallback for browsers without WebP/AVIF. */
const FALLBACK_MAX = 1280;
/** Bump when the encoder settings change: every hash (and so every cached URL) changes with it. */
const PRESET = "v1:avif-q50-e4:webp-q72-e4:jpg-q76-moz";

const force = process.argv.includes("--force");
const quiet = process.argv.includes("--quiet");
const log = (...a) => { if (!quiet) console.log(...a); };

async function walk(rel) {
  const abs = path.join(PUBLIC, rel);
  if (!existsSync(abs)) return [];
  const s = await stat(abs);
  if (s.isFile()) return EXT.test(rel) ? [rel] : [];
  const out = [];
  for (const e of await readdir(abs, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const child = path.posix.join(rel, e.name);
    if (e.isDirectory()) out.push(...(await walk(child)));
    else if (EXT.test(e.name)) out.push(child);
  }
  return out;
}

const hex = (n) => n.toString(16).padStart(2, "0");
const widthsFor = (w) => {
  const list = WIDTHS.filter((x) => x < w);
  if (w <= WIDTHS.at(-1)) list.push(w);
  else list.push(WIDTHS.at(-1));
  return list;
};
const fileName = (hash, w, ext) => `${hash}-${w}.${ext}`;

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (i < items.length) { const it = items[i++]; await fn(it); } }));
}

async function main() {
  const t0 = Date.now();
  await mkdir(OUT_DIR, { recursive: true });
  const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
  const files = (await Promise.all(SOURCES.map(walk))).flat().sort();
  const manifest = {};
  const keep = new Set();
  const jobs = new Map(); // hash -> job (identical files share their variants)
  for (const rel of files) {
    const buf = await readFile(path.join(PUBLIC, rel));
    const hash = createHash("sha256").update(PRESET).update(buf).digest("hex").slice(0, 16);
    const src = `/${rel}`;
    if (!jobs.has(hash)) jobs.set(hash, { hash, buf, srcs: [] });
    jobs.get(hash).srcs.push(src);
  }

  let built = 0;
  sharp.concurrency(1);
  await pool([...jobs.values()], Math.max(2, cpus().length), async (job) => {
    const prev = job.srcs.map((s) => previous[s]).find((e) => e && e[2] === job.hash);
    let entry;
    if (prev && !force) {
      const [w, h, , , widths, fb, fbw] = prev;
      const names = [...widths.flatMap((x) => [fileName(job.hash, x, "avif"), fileName(job.hash, x, "webp")]), fileName(job.hash, fbw, fb)];
      if (names.every((n) => existsSync(path.join(OUT_DIR, n)))) entry = [w, h, job.hash, prev[3], widths, fb, fbw];
    }
    if (!entry) {
      const base = sharp(job.buf, { failOn: "none" }).rotate(); // EXIF orientation applied, metadata stripped
      const meta = await sharp(job.buf).metadata();
      const w = meta.autoOrient?.width ?? meta.width, h = meta.autoOrient?.height ?? meta.height;
      const opaque = (await base.clone().stats()).isOpaque;
      // Placeholder: the photo's average colour, only for opaque photos (a colour would show through transparency).
      const avg = await base.clone().resize(1, 1, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const colour = opaque ? `#${hex(avg[0])}${hex(avg[1])}${hex(avg[2])}` : "";
      const widths = widthsFor(w);
      const fb = opaque ? "jpg" : "png";
      const fbw = Math.min(w, FALLBACK_MAX);
      for (const x of widths) {
        const resized = base.clone().resize({ width: x, withoutEnlargement: true });
        await resized.clone().avif({ quality: 50, effort: 4 }).toFile(path.join(OUT_DIR, fileName(job.hash, x, "avif")));
        await resized.clone().webp({ quality: 72, effort: 4 }).toFile(path.join(OUT_DIR, fileName(job.hash, x, "webp")));
      }
      const fallback = base.clone().resize({ width: fbw, withoutEnlargement: true });
      await (fb === "jpg" ? fallback.jpeg({ quality: 76, mozjpeg: true, progressive: true }) : fallback.png({ compressionLevel: 9, palette: true })).toFile(path.join(OUT_DIR, fileName(job.hash, fbw, fb)));
      entry = [w, h, job.hash, colour, widths, fb, fbw];
      built++;
    }
    for (const s of job.srcs) manifest[s] = entry;
    for (const x of entry[4]) { keep.add(fileName(job.hash, x, "avif")); keep.add(fileName(job.hash, x, "webp")); }
    keep.add(fileName(job.hash, entry[6], entry[5]));
  });

  // Variants of photos that changed or were removed.
  let removed = 0;
  for (const name of await readdir(OUT_DIR)) if (!keep.has(name)) { await rm(path.join(OUT_DIR, name)); removed++; }

  // One line per photo: small, and a readable diff when a photo changes.
  const lines = Object.keys(manifest).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(manifest[k])}`);
  const json = `{\n${lines.join(",\n")}\n}\n`;
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  const before = existsSync(MANIFEST) ? await readFile(MANIFEST, "utf8") : "";
  if (before !== json) await writeFile(MANIFEST, json);
  log(`images: ${files.length} sources (${jobs.size} unique), ${built} built, ${removed} stale removed, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((err) => { console.error(err); process.exit(1); });
