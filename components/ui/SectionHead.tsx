import Link from "next/link";
import { cn } from "@/lib/cn";

export default function SectionHead({ eyebrow, title, sub, href, hrefLabel = "See all", className }: { eyebrow?: string; title: React.ReactNode; sub?: string; href?: string; hrefLabel?: string; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1.5 text-clay-600">{eyebrow}</p>}
        <h2 className="font-display text-[28px] leading-[1.1] font-medium md:text-[32px]">{title}</h2>
        {sub && <p className="mt-1.5 max-w-xl text-[15px] text-mute">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-ink-900 underline decoration-clay-400 decoration-2 underline-offset-4 hover:text-clay-600">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
