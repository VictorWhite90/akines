import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import Button from "@/components/kin/Button";
import { Skeleton } from "@/components/kin/Overlay";
import { FACE, PHOTO, type PhotoKey } from "@/lib/data/images";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/** Small pieces of the design's Community Home (classes in home.css), fed by our photos and people. */

/** Unsplash sources are sized here (the app's image loader does the same for next/image). */
const sized = (src: string, w: number) => (src.startsWith("https://images.unsplash.com/") && !src.includes("?") ? `${src}?w=${w}&q=70&auto=format&fit=crop` : src);
export const photoSrc = (p: PhotoKey | string, w = 800) => sized((PHOTO as Record<string, { src: string }>)[p]?.src ?? p, w);
export const faceSrc = (id: PersonId, w = 160) => { const f = (PEOPLE[id] as { face?: string } | undefined)?.face; const src = f ? (FACE as Record<string, { src: string }>)[f]?.src : undefined; return src ? sized(src, w) : undefined; };

export function FdPhoto({ src, className, eager, position }: { src: string; className?: string; eager?: boolean; position?: string }) {
  return (
    <div className={["fd-photo", className].filter(Boolean).join(" ")} data-m="frame">
      {/* eslint-disable-next-line @next/next/no-img-element -- the design's cover image */}
      <img className="cover" src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} style={position ? { objectPosition: position } : undefined} />
    </div>
  );
}

export function FdAvatar({ id, size = 32, ring }: { id: PersonId; size?: number; ring?: boolean }) {
  const src = faceSrc(id);
  return (
    <span className={ring ? "fd-av fd-av--ring" : "fd-av"} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- member face */}
      {src ? <img src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </span>
  );
}

export function FdFaces({ ids, size = 32, overlap = 8 }: { ids: PersonId[]; size?: number; overlap?: number }) {
  return <span className="fd-avs" style={{ "--fd-overlap": `-${overlap}px` } as React.CSSProperties}>{ids.map((id) => <FdAvatar key={id} id={id} size={size} ring />)}</span>;
}

export function FdLink({ href, onClick, children, className }: { href?: string; onClick?: () => void; children: React.ReactNode; className?: string }) {
  const cls = ["fd-link", className].filter(Boolean).join(" ");
  const inner = <><span>{children}</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></>;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button type="button" className={cls} onClick={onClick}>{inner}</button>;
}

/* ---- loading and error (the design's feed/parts.tsx; copy from its content.ts) ---- */
const FILL = { width: "100%", height: "100%", radius: 0 } as const;

export function SkeletonCards({ n = 3 }: { n?: number }) {
  return (
    <div className="fd-row fd-row--sk" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <div className="fd-sk-card" key={i}>
          <div className="fd-sk-photo"><Skeleton {...FILL} /></div>
          <Skeleton width="86%" height={24} radius={2} />
          <Skeleton width="100%" height={14} radius={2} />
          <Skeleton width="64%" height={14} radius={2} />
        </div>
      ))}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="fd-section fd-section--sk" aria-hidden>
      <div className="fd-head">
        <div className="fd-head__copy">
          <Skeleton width="min(420px, 80%)" height={32} radius={2} />
          <Skeleton width="min(560px, 90%)" height={16} radius={2} />
        </div>
        <Skeleton width={96} height={16} radius={2} />
      </div>
      <SkeletonCards />
    </div>
  );
}

/** Six grey sections. `note` adds the "Getting things ready" line above them (the loading state). */
export function FeedSkeleton({ note }: { note?: boolean }) {
  return (
    <div className="fd-feed__sk" aria-busy="true" aria-label="Loading your feed" role="status">
      {note ? <p className="fd-note"><RefreshCw size={18} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} /><span>Getting things ready</span></p> : null}
      {Array.from({ length: 6 }, (_, i) => <SkeletonSection key={i} />)}
    </div>
  );
}

export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fd-error" role="alert">
      <h3 className="fd-error__title">We could not load this section.</h3>
      <p className="fd-error__text">Your conversations and projects are safe. Check your connection and try again. The rest of your page is still here.</p>
      <div><Button variant="secondary" onClick={onRetry}>Try again</Button></div>
    </div>
  );
}
