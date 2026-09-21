import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-green-950 text-white hover:bg-green-900",
  secondary: "bg-gold-400 text-green-950 hover:bg-gold-300",
  outline: "border border-green-950 text-green-950 hover:bg-green-950 hover:text-white",
  ghost: "text-green-950 hover:bg-sand-100",
  danger: "bg-alert text-white hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

type Common = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

const COMMON_KEYS = ["variant", "size", "icon", "className", "children"] as const;

/** Strips Button's own props so the rest can be spread onto the element. */
function omitCommon<T extends Common>(props: T): Omit<T, (typeof COMMON_KEYS)[number]> {
  const rest: Record<string, unknown> = { ...props };
  for (const key of COMMON_KEYS) delete rest[key];
  return rest as Omit<T, (typeof COMMON_KEYS)[number]>;
}

/** Brand button. Pass `href` to render a Next link styled the same way. */
export default function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", icon, className, children } = props;
  const classes = cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[2px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (props.href !== undefined) {
    const rest = omitCommon(props as AsLink);
    return (
      <Link className={classes} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }

  const rest = omitCommon(props as AsButton);
  return (
    <button type="button" className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
