"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * primary: ink pill, the one main action. secondary: outlined. accent: amber, rare.
 * ghost: no fill until hover. link: underlined text with an arrow. danger: outlined red.
 * `light` is for buttons that sit on a photograph.
 */
export type Variant = "primary" | "secondary" | "accent" | "ghost" | "link" | "danger";
type Common = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  /** Icon-only round button. Give it an aria-label. */
  icon?: boolean;
  block?: boolean;
  light?: boolean;
  /** Adds the arrow that nudges right on hover. */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};
type LinkProps = Common & { href: string; onClick?: React.MouseEventHandler<HTMLAnchorElement>; "aria-label"?: string; "aria-current"?: React.AriaAttributes["aria-current"]; target?: string; rel?: string };
type ActionProps = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };

/** One button for links and actions. The fill rises from below on hover and the button presses down on click. */
export default function Button(props: LinkProps | ActionProps) {
  const { variant = "secondary", size = "md", icon, block, light, arrow, className, children, ...rest } = props;
  const cls = cn("k-btn", variant, size !== "md" && size, icon && "icon", block && "block", light && "light", className);
  const inner = icon ? <span className="k-btn-glyph">{children}</span> : (
    <>
      <span className="k-btn-label">{children}</span>
      {arrow && <span className="k-btn-arrow" aria-hidden><ArrowRight size={variant === "link" ? 16 : 14} strokeWidth={2} /></span>}
    </>
  );
  if (props.href !== undefined) {
    const { href, onClick, target, rel } = props;
    return <Link href={href} onClick={onClick} className={cls} target={target} rel={rel} aria-label={props["aria-label"]} aria-current={props["aria-current"]}>{inner}</Link>;
  }
  const { type = "button", ...btn } = rest as Omit<ActionProps, keyof Common>;
  return <button type={type} className={cls} {...btn}>{inner}</button>;
}
