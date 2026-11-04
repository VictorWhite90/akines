import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
