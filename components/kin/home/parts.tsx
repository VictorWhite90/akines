import Link from "next/link";
import { ArrowRight, CircleAlert, RefreshCw } from "lucide-react";
import Button from "@/components/kin/Button";
import Img from "@/components/kin/Img";
import { Skeleton } from "@/components/kin/Overlay";
import { useMedia } from "@/components/kin/useMedia";
import type { ImageInput } from "@/lib/images";
import { FACE, PHOTO, type PhotoKey } from "@/lib/data/images";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/** Small pieces of the design's Community Home (classes in home.css), fed by our photos and people. */

/** A photo key (lib/data/images) or a path, as the photo's address; Img picks the right size and format. */
export const photoSrc = (p: PhotoKey | string) => (PHOTO as Record<string, { src: string }>)[p]?.src ?? p;
/** A member's face (their designer portrait), or undefined. */
export const faceSrc = (id: PersonId) => { const f = (PEOPLE[id] as { face?: string } | undefined)?.face; return f ? (FACE as Record<string, { src: string }>)[f]?.src : undefined; };

/** A cover photo filling its frame. `sizes` is how wide the frame is drawn (see Img). */
export function FdPhoto({ src, className, eager, position, sizes }: { src: ImageInput; className?: string; eager?: boolean; position?: string; sizes: string }) {
  return (
    <div className={["fd-photo", className].filter(Boolean).join(" ")} data-m="frame">
      <Img className="cover" src={src} sizes={sizes} priority={eager} draggable={false} style={position ? { objectPosition: position } : undefined} />
    </div>
  );
}

/** A member's face, or `src` when a card shows a particular photo (the design reuses photos across people).
 * `size` is the default; an ancestor can set --fd-face (the phone layout does, home-mobile.css). */
export function FdAvatar({ id, src: given, size = 32, ring }: { id?: PersonId; src?: ImageInput; size?: number; ring?: boolean }) {
  const src = given ?? (id ? faceSrc(id) : undefined);
  const s = `var(--fd-face, ${size}px)`;
  return (
    <span className={ring ? "fd-av fd-av--ring" : "fd-av"} style={{ width: s, height: s }}>
      {src ? <Img src={src} sizes={`${size}px`} draggable={false} /> : null}
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
const usePhoneLayout = () => useMedia("(max-width: 767px)");

/** Phone sizes of the design's Feed Skeleton Section / Mobile: square bars, title 180 x 20, lines 240 and 200 x 12. */
const SK_PHONE = { title: [180, 20], lines: [[240, 12], [200, 12]], head: [[220, 28], [300, 14]] } as const;

export function SkeletonCards({ n = 3 }: { n?: number }) {
  const phone = usePhoneLayout();
  return (
    <div className="fd-row fd-row--sk" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <div className="fd-sk-card" key={i}>
          <div className="fd-sk-photo"><Skeleton {...FILL} /></div>
          {phone ? (
            <>
              <Skeleton width={SK_PHONE.title[0]} height={SK_PHONE.title[1]} radius={0} />
              {SK_PHONE.lines.map(([w, h]) => <Skeleton key={w} width={w} height={h} radius={0} />)}
            </>
          ) : (
            <>
              <Skeleton width="86%" height={24} radius={2} />
              <Skeleton width="100%" height={14} radius={2} />
              <Skeleton width="64%" height={14} radius={2} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** Phones: two bars and no link (the design). */
function SkeletonSection() {
  const phone = usePhoneLayout();
  return (
    <div className="fd-section fd-section--sk" aria-hidden>
      <div className="fd-head">
        <div className="fd-head__copy">
          {phone ? SK_PHONE.head.map(([w, h]) => <Skeleton key={w} width={`min(${w}px, 100%)`} height={h} radius={0} />) : (
            <>
              <Skeleton width="min(420px, 80%)" height={32} radius={2} />
              <Skeleton width="min(560px, 90%)" height={16} radius={2} />
            </>
          )}
        </div>
        {phone ? null : <Skeleton width={96} height={16} radius={2} />}
      </div>
      <SkeletonCards />
    </div>
  );
}

/** Six grey sections. `note` adds the "Getting things ready" line above them (the loading state). */
export function FeedSkeleton({ note }: { note?: boolean }) {
  const phone = usePhoneLayout();
  return (
    <div className="fd-feed__sk" aria-busy="true" aria-label="Loading your feed" role="status">
      {note ? <p className="fd-note"><RefreshCw size={phone ? 16 : 18} strokeWidth={phone ? 1.5 : 1.25} absoluteStrokeWidth aria-hidden focusable={false} /><span>Getting things ready</span></p> : null}
      {Array.from({ length: 6 }, (_, i) => <SkeletonSection key={i} />)}
    </div>
  );
}

export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  // Phones: the alert icon sits beside the title (the design's Feed Section Error / Mobile).
  const phone = usePhoneLayout();
  const title = <h3 className="fd-error__title">We could not load this section.</h3>;
  return (
    <div className="fd-error" role="alert">
      {phone ? <div className="fd-error__head"><span className="fd-error__icon" aria-hidden><CircleAlert size={24} strokeWidth={1.5} absoluteStrokeWidth aria-hidden focusable={false} /></span>{title}</div> : title}
      <p className="fd-error__text">Your conversations and projects are safe. Check your connection and try again. The rest of your page is still here.</p>
      <div><Button variant="secondary" onClick={onRetry}>Try again</Button></div>
    </div>
  );
}
