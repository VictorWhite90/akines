import Link from "next/link";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-ink-900 text-paper-50 hover:bg-ink-700",
  gold: "bg-ochre-400 text-ink-950 hover:bg-ochre-300",
  clay: "bg-clay-500 text-paper-50 hover:bg-clay-600",
  ghost: "border border-ink-900/20 text-ink-900 hover:bg-ink-900/5",
  "ghost-dark": "border border-paper-50/30 text-paper-50 hover:bg-paper-50/10",
  soft: "bg-paper-200 text-ink-900 hover:bg-paper-300",
} as const;

const SIZES = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]" } as const;

type Common = { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES; className?: string; children: React.ReactNode };
type LinkProps = Common & { href: string };
type ActionProps = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };

/** One button for links and actions, so both look the same. */
export default function Button(props: LinkProps | ActionProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const cls = cn("inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-50", VARIANTS[variant], SIZES[size], className);
  if (props.href !== undefined) {
    const external = props.href.startsWith("http");
    return (
      <Link href={props.href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as Omit<ActionProps, keyof Common>)}>
      {children}
    </button>
  );
}
