import Image from "next/image";
import { ShieldTick } from "iconsax-reactjs";
import { cn } from "@/lib/cn";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
} as const;
const PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 } as const;

/** Warm, brand-adjacent backgrounds for initials, picked by name. */
const SWATCHES = ["bg-gold-300 text-ruby-800", "bg-green-100 text-green-900", "bg-ruby-100 text-ruby-800", "bg-sand-200 text-green-950", "bg-calm-bg text-calm"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function swatch(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SWATCHES[hash % SWATCHES.length];
}

export default function Avatar({
  name,
  src,
  size = "md",
  verified = false,
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
  verified?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
          SIZES[size],
          !src && swatch(name),
        )}
      >
        {src ? (
          <Image src={src} alt="" width={PX[size]} height={PX[size]} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{initials(name)}</span>
        )}
      </span>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white" title="Verified">
          <ShieldTick size={size === "xl" ? 22 : 14} variant="Bold" color="var(--color-verified)" aria-label="Verified" />
        </span>
      )}
    </span>
  );
}

/** Overlapping avatars, e.g. the people already in a Presence Room. */
export function AvatarStack({ names, max = 5, size = "sm" }: { names: string[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="flex -space-x-2">
      {shown.map((name) => (
        <Avatar key={name} name={name} size={size} className="ring-2 ring-white rounded-full" />
      ))}
      {rest > 0 && (
        <span className={cn("inline-flex items-center justify-center rounded-full bg-grey-200 font-semibold text-grey-800 ring-2 ring-white", SIZES[size])}>
          +{rest}
        </span>
      )}
    </span>
  );
}
