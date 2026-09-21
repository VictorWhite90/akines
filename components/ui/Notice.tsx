import type { ReactNode } from "react";
import { InfoCircle, Lock1, ShieldTick, Warning2 } from "iconsax-reactjs";
import { cn } from "@/lib/cn";

const TONES = {
  info: { cls: "border-sand-200 bg-sand-100 text-green-950", Icon: InfoCircle },
  private: { cls: "border-calm/30 bg-calm-bg text-calm", Icon: Lock1 },
  trust: { cls: "border-verified/20 bg-verified-bg text-verified", Icon: ShieldTick },
  safety: { cls: "border-alert/20 bg-alert-bg text-alert", Icon: Warning2 },
} as const;

/** Inline explanation box: privacy promises, AI limits, safety notes. */
export default function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { cls, Icon } = TONES[tone];
  return (
    <div role="note" className={cn("flex gap-3 rounded-[4px] border p-4 text-sm", cls, className)}>
      <Icon size={20} variant="Bulk" color="currentColor" className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn("leading-relaxed", title && "mt-1", "text-grey-800")}>{children}</div>
      </div>
    </div>
  );
}
