import { cn } from "@/lib/cn";

const TONES = {
  paper: "bg-paper-200 text-ink-800",
  outline: "border border-line text-ink-800 bg-paper-50",
  clay: "bg-clay-100 text-clay-700",
  ochre: "bg-ochre-200 text-ink-900",
  ink: "bg-ink-900 text-paper-50",
  moss: "bg-moss-100 text-moss-700",
  dark: "bg-paper-50/10 text-paper-50 border border-paper-50/15",
} as const;

export default function Chip({ tone = "paper", className, children }: { tone?: keyof typeof TONES; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", TONES[tone], className)}>{children}</span>;
}

/** Marks anything an AI produced, so it never passes for a person's or verified fact. */
export function AiTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-ink-900/15 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap uppercase tracking-[0.12em] text-mute", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
      AI suggestion
    </span>
  );
}
