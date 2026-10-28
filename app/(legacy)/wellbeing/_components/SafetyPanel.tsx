import { useId } from "react";
import { Call, Heart } from "iconsax-reactjs";
import { cn } from "@/lib/cn";
import { EMERGENCY_NUMBERS } from "../_data";

/**
 * Calm safety response (W4). Shown in place of a normal reflection when
 * crisis language is detected, and from "Need to talk to someone now?".
 */
export default function SafetyPanel({
  id,
  onClose,
  closeLabel = "Close",
  headingLevel = 3,
  triggered = true,
  className,
}: {
  id?: string;
  headingLevel?: 2 | 3 | 4;
  /** True when opened because crisis language was detected in something the member typed. */
  triggered?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}) {
  const headingId = `${useId()}-heading`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 rounded-[4px] border border-calm/30 bg-white p-5 outline-none sm:p-6", className)}
    >
      <div className="flex items-center gap-2 text-calm">
        <Heart size={20} variant="Bulk" color="currentColor" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">You don&apos;t have to carry this alone</p>
      </div>
      <Heading id={headingId} className="mt-3 font-playfair text-xl font-semibold text-green-950">
        If you&apos;re in immediate danger, call your local emergency number.
      </Heading>
      <p className="mt-2 text-sm leading-relaxed text-grey-800">
        {triggered
          ? "Thank you for putting that into words. What you're feeling matters, and you deserve support from a real person right now — not a reflection prompt."
          : "Reaching out is a strong thing to do. You deserve support from a real person, today."}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {EMERGENCY_NUMBERS.map((row) => (
          <li key={row.country} className="flex items-center justify-between gap-3 rounded-[4px] bg-calm-bg px-4 py-3 text-sm">
            <span className="text-green-950">{row.country}</span>
            <span className="flex items-center gap-1.5 font-semibold text-green-950">
              <Call size={16} variant="Bulk" color="currentColor" aria-hidden />
              {row.number}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-grey-800">
        <strong className="font-semibold text-green-950">Artelia Connect is not an emergency service.</strong> {triggered ? "Nobody at Artelia will see what you typed, and it has not been saved. " : ""}If you can, tell someone near you — a friend, family member or neighbour — how you are feeling.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="#therapists"
          className="inline-flex h-11 items-center justify-center rounded-[2px] bg-green-950 px-5 text-sm font-semibold text-white hover:bg-green-900"
        >
          Find a licensed therapist
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[2px] px-5 text-sm font-semibold text-green-950 hover:bg-sand-100"
          >
            {closeLabel}
          </button>
        )}
      </div>
    </section>
  );
}
