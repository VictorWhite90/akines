"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { PHOTO, type PhotoKey } from "@/lib/data/images";
import { cn } from "@/lib/cn";
import { spring } from "./motion";

const MotionLink = motion.create(Link);

/** A standalone object you can pick up: hairline border, one radius, presses down slightly. Use sparingly. */
export default function Card({ href, className, children, as: Tag = "article" }: { href?: string; className?: string; children: React.ReactNode; as?: "article" | "div" | "li" }) {
  const reduced = useReducedMotion();
  if (href) return <MotionLink href={href} className={cn("k-card", className)} whileTap={reduced ? undefined : { scale: 0.985 }} transition={spring.press}>{children}</MotionLink>;
  return <Tag className={cn("k-card", className)}>{children}</Tag>;
}

/** A catalogue photo (or an uploaded URL) filling a box with a fixed ratio. */
export function Media({ photo, ratio = "16 / 10", sizes = "(max-width: 639px) 100vw, 480px", priority = false, position, className, children, layoutId, style }: { photo: PhotoKey | string; ratio?: string; sizes?: string; priority?: boolean; position?: string; className?: string; children?: React.ReactNode; layoutId?: string; style?: React.CSSProperties }) {
  const p = PHOTO[photo as PhotoKey];
  const src = p ? p.src : (photo as string);
  const alt = p ? p.alt : "";
  return (
    <motion.div className={cn("k-media", className)} style={{ aspectRatio: ratio, ...style }} layoutId={layoutId} transition={spring.layout}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!p} style={{ objectPosition: position }} />
      {children}
    </motion.div>
  );
}
