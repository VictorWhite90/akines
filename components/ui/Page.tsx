import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Standard page width and gutters. Wrap every route's content in this. */
export default function Page({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10", wide ? "max-w-7xl" : "max-w-6xl", className)}>{children}</div>;
}
