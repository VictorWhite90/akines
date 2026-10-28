"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "./motion";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Common = { variant?: Variant; size?: "md" | "sm"; icon?: boolean; block?: boolean; className?: string; children: React.ReactNode };
type LinkProps = Common & { href: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> };
type ActionProps = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };

/** One button for links and actions. Presses down on a spring; amber only for the primary action. */
export default function Button(props: LinkProps | ActionProps) {
  const { variant = "secondary", size = "md", icon, block, className, children, ...rest } = props;
  const reduced = useReducedMotion();
  const cls = cn("k-btn", variant, size === "sm" && "sm", icon && "icon", block && "block", className);
  const tap = reduced ? undefined : { scale: 0.97 };
  if (props.href !== undefined) {
    const { href, onClick } = props;
    return <MotionLink href={href} onClick={onClick} className={cls} whileTap={tap} transition={spring.press}>{children}</MotionLink>;
  }
  const { type = "button", ...btn } = rest as Omit<ActionProps, keyof Common>;
  return <motion.button type={type} className={cls} whileTap={tap} transition={spring.press} {...(btn as object)}>{children}</motion.button>;
}
