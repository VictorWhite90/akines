"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import Tooltip from "./Tooltip";

/**
 * The product design's button (classes from components/kin/akines/library.css):
 * k-btn k-btn--{variant} k-btn--{size} [k-btn--light] [k-btn--full|fluid] k-btn--live|disabled|loading,
 * a label span and optional icon spans. The fill rises from below on hover; it presses to 97%.
 */
export type Variant = "primary" | "secondary" | "accent" | "ghost" | "link" | "danger";
type Nudge = "right" | "up-right" | "down";
type Common = {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
  full?: boolean;
  fluid?: boolean;
  loading?: boolean;
  /** An icon before the label. */
  icon?: React.ReactNode;
  /** The arrow after the label, as the design uses it. */
  arrow?: Nudge;
  /** A custom icon after the label (takes the place of `arrow`). */
  iconRight?: React.ReactNode;
  /** Looks disabled but still clickable, so the click can explain what is missing. */
  looksDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
};
type LinkProps = Common & { href: string; onClick?: React.MouseEventHandler<HTMLAnchorElement>; "aria-label"?: string; "aria-current"?: React.AriaAttributes["aria-current"]; target?: string; rel?: string; disabled?: undefined };
type ActionProps = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };

const ARROW: Record<Nudge, typeof ArrowRight> = { right: ArrowRight, "up-right": ArrowUpRight, down: ArrowDown };

export function btnClass({ variant = "primary", size = "md", light, full, fluid, loading, disabled, looksDisabled, className }: Partial<Common> & { disabled?: boolean }) {
  return cn("k-btn", `k-btn--${variant}`, `k-btn--${size}`, light && "k-btn--light", fluid && "k-btn--fluid", full && "k-btn--full", loading && "k-btn--loading", (disabled || looksDisabled) && "k-btn--disabled", !disabled && !looksDisabled && !loading && "k-btn--live", className);
}

export default function Button(props: LinkProps | ActionProps) {
  const { variant, size, light, full, fluid, loading, looksDisabled, icon, iconRight, arrow, className, children, ...rest } = props;
  const disabled = "disabled" in props && !!props.disabled;
  const cls = btnClass({ variant, size, light, full, fluid, loading, disabled, looksDisabled, className });
  const Arrow = arrow ? ARROW[arrow] : null;
  const right = iconRight ?? (Arrow ? <Arrow strokeWidth={1.5} aria-hidden focusable={false} /> : null);
  const inner = (
    <>
      {loading && <span className="k-btn__spinner" aria-hidden />}
      {icon && <span className="k-btn__icon" aria-hidden>{icon}</span>}
      {children != null && children !== false && <span className="k-btn__label">{children}</span>}
      {right && <span className="k-btn__icon k-btn__icon--right" data-nudge={arrow ?? "right"} aria-hidden>{right}</span>}
    </>
  );
  if (props.href !== undefined) {
    const { href, onClick, target, rel } = props;
    return <Link href={href} onClick={(e) => { if (loading) { e.preventDefault(); return; } onClick?.(e); }} className={cls} target={target} rel={rel} aria-label={props["aria-label"]} aria-current={props["aria-current"]} aria-disabled={loading || looksDisabled || undefined} aria-busy={loading || undefined}>{inner}</Link>;
  }
  const { type = "button", onClick, ...btn } = rest as Omit<ActionProps, keyof Common>;
  return <button type={type} className={cls} {...btn} disabled={disabled} aria-disabled={looksDisabled || undefined} aria-busy={loading || undefined} onClick={loading ? (e) => e.preventDefault() : onClick}>{inner}</button>;
}

/** The round icon button (k-iconbtn), with the design's tooltip naming it. */
export function IconButton({ label, variant = "ghost", size = "md", light, href, tooltip = true, className, children, ...rest }: { label: string; variant?: "ghost" | "primary" | "secondary"; size?: "sm" | "md" | "lg"; light?: boolean; href?: string; tooltip?: boolean; className?: string; children: React.ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  const cls = cn("k-iconbtn", `k-iconbtn--${size}`, `k-btn--${variant}`, light && "k-btn--light", rest.disabled ? "k-btn--disabled" : "k-btn--live", className);
  const inner = <><span className="k-iconbtn__fx" aria-hidden /><span className="k-iconbtn__glyph" aria-hidden>{children}</span></>;
  const { type = "button", ...btn } = rest;
  const el = href ? <Link href={href} className={cls} aria-label={label}>{inner}</Link> : <button type={type} className={cls} aria-label={label} {...btn}>{inner}</button>;
  return tooltip ? <Tooltip label={label} describe={false}>{el}</Tooltip> : el;
}
