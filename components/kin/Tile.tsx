import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PhotoKey } from "@/lib/data/images";
import { Media } from "./Card";

/** A section's title, its quiet line, and the "see all" link on the right. */
export function SectionHead({ id, title, sub, href, cta }: { id: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="k-sec-head">
      <div>
        <h2 id={id}>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {href && cta && <Link href={href} className="k-link">{cta}<ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link>}
    </div>
  );
}

/**
 * A square photo, an amber label, a title in Alice, two lines, then two facts under a hairline.
 * The card for rooms, projects, activities, studios and stories.
 */
export function Tile({ href, photo, label, title, text, left, right, sizes = "(max-width: 639px) 100vw, (max-width: 1279px) 45vw, 300px" }: { href: string; photo: PhotoKey | string; label?: string; title: string; text?: string; left?: React.ReactNode; right?: React.ReactNode; sizes?: string }) {
  return (
    <Link href={href} className="k-tile">
      <Media photo={photo} ratio="1" sizes={sizes} />
      <span className="k-tile-body">
        {label && <span className="k-eyebrow brand">{label}</span>}
        <span className="k-tile-title">{title}</span>
        {text && <span className="k-tile-text">{text}</span>}
      </span>
      {(left || right) && <span className="k-tile-foot"><span>{left}</span><span>{right}</span></span>}
    </Link>
  );
}
