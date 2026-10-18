"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { canGoBack } from "@/lib/navHistory";

/** A Back button that returns to the previous page in the app, or to `fallback` if there isn't one. */
export default function BackLink({ fallback, className, children, ...rest }: { fallback: string; className?: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      className={className}
      onClick={(e) => {
        if (canGoBack()) {
          e.preventDefault();
          router.back();
        }
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
