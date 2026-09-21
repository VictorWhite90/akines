import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Plain surface. `tone="sand"` for secondary panels on white pages. */
export default function Card({
  children,
  className,
  tone = "white",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "sand" | "green";
  as?: "div" | "section" | "article" | "li" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[4px] border",
        tone === "white" && "border-sand-200 bg-white",
        tone === "sand" && "border-sand-200 bg-sand-100",
        tone === "green" && "border-green-900 bg-green-950 text-white",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
