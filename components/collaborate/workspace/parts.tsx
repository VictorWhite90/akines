"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

/*
 * Small pieces every workspace page uses, mirrored from the product design (classes cw-* and cd-* in ../styles):
 * its own 16px line icons, the text link, the back link, the small label, initials, portraits and dots.
 */

function Svg({ size = 16, box = 16, sw = 1.25, children }: { size?: number; box?: number; sw?: number; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">{children}</svg>;
}
export const IconArrow = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" /></Svg>;
export const IconBack = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M13 8H3.5M7.5 3.5 3 8l4.5 4.5" /></Svg>;
export const IconUpRight = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" /></Svg>;
export const IconCheck = ({ size = 14, sw = 1.25 }: { size?: number; sw?: number }) => <Svg size={size} sw={sw}><path d="m3 8.5 3.2 3.2L13 4.8" /></Svg>;
export const IconChevron = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="m6 3.5 4.5 4.5L6 12.5" /></Svg>;
export const IconDoc = () => <Svg sw={1.2}><path d="M4 1.8h5.2L12.2 4.8v9.4H4z" /><path d="M9 1.8v3.2h3.2M6 8h4M6 10.5h4" /></Svg>;

export type Tone = "accent" | "green" | "gray";
export function Dot({ tone = "accent", size = 8 }: { tone?: Tone; size?: number }) {
  return <i className={`cw-dot cw-dot--${tone}`} style={{ ["--cw-dot" as string]: `${size}px` } as React.CSSProperties} aria-hidden />;
}

/** The small uppercase label (cw-over). */
export function Over({ as: As = "p", className, children }: { as?: "p" | "h2" | "h3" | "span"; className?: string; children: React.ReactNode }) {
  return <As className={cn("cw-over", className)}>{children}</As>;
}

/** The design's text link (cw-link), a link or a button, with an optional arrow. */
export function CwLink({ href, onClick, arrow, className, children, ...rest }: { href?: string; onClick?: () => void; arrow?: boolean; className?: string; children: React.ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  const inner = <><span className="cw-link__label">{children}</span>{arrow ? <IconArrow /> : null}</>;
  return href ? <Link href={href} className={cn("cw-link", className)}>{inner}</Link> : <button type="button" className={cn("cw-link", className)} onClick={onClick} {...rest}>{inner}</button>;
}

/** "Back to …" above a page heading (cw-back). */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="cw-back"><IconBack /><span>{children}</span></Link>;
}

/** Initials in a circle (cw-av). */
export function Initials({ initials, size = 32, tone = "brand", className }: { initials: string; size?: number; tone?: "brand" | "muted"; className?: string }) {
  return <span className={cn("cw-av", `cw-av--${tone}`, className)} style={{ ["--cw-av" as string]: `${size}px`, ["--cw-fs" as string]: `${size >= 48 ? 13 : size >= 36 ? 12 : 11}px` } as React.CSSProperties} aria-hidden>{initials}</span>;
}

/** A round photo with an optional availability dot (cd-portrait). */
export function Portrait({ src, size = 56, tone, className, initials }: { src?: string; size?: number; tone?: Tone; className?: string; initials?: string }) {
  return (
    <span className={cn("cd-portrait", className)} style={{ ["--cd-p" as string]: `${size}px` } as React.CSSProperties} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
      {src ? <img alt="" width={size} height={size} loading="lazy" decoding="async" src={src} /> : initials ? <Initials initials={initials} size={size} /> : null}
      {tone ? <i className={cn("cd-portrait__dot", `cd-portrait__dot--${tone}`)} /> : null}
    </span>
  );
}

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/** "2 hours ago", "Yesterday", "3 days ago": how the design dates recent things. */
export function ago(at: number) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return d < 14 ? "Last week" : `${Math.round(d / 7)} weeks ago`;
}
/** "Today, 10:42 AM" / "Yesterday, 4:12 PM" / "3 Nov, 9:05 AM". */
export function when(at: number) {
  const d = new Date(at), now = new Date();
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const days = Math.round((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (days === 0) return `Today, ${t}`;
  if (days === 1) return `Yesterday, ${t}`;
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}, ${t}`;
}
