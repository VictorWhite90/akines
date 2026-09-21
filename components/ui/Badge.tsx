import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "green" | "gold" | "ruby" | "calm" | "ai" | "alert";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-grey-200 text-grey-800",
  green: "bg-verified-bg text-verified",
  gold: "bg-gold-300/60 text-ruby-800",
  ruby: "bg-ruby-100 text-ruby-700",
  calm: "bg-calm-bg text-calm",
  ai: "bg-ai-bg text-ai",
  alert: "bg-alert-bg text-alert",
};

export default function Badge({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
