"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const EXIT_MS = 300;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
const focusables = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.hasAttribute("hidden") && n.getAttribute("aria-hidden") !== "true" && (n.offsetWidth > 0 || n.offsetHeight > 0 || n === document.activeElement));

/** Mounted while open and for the exit animation; `state` drives data-state="open|closed". */
function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- presence follows the open prop
      setMounted(true);
      setState("open");
      return;
    }
    setState("closed");
    const t = window.setTimeout(() => setMounted(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);
  return { mounted, state };
}

type Props = { open: boolean; onClose: () => void; title?: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; image?: string; flush?: boolean; footer?: React.ReactNode; hideClose?: boolean; closeOnBackdrop?: boolean; label?: string; className?: string; children?: React.ReactNode };

function Layer({ open, onClose, kind, panelClass, panelStyle, title, description, eyebrow, image, flush, footer, hideClose, closeOnBackdrop = true, label, children }: Props & { kind: "modal" | "drawer"; panelClass?: string; panelStyle?: React.CSSProperties }) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portals need the document
  useEffect(() => setReady(true), []);
  const { mounted, state } = usePresence(open);
  const panel = useRef<HTMLDivElement>(null);
  const downOnBackdrop = useRef(false);
  const uid = useId().replace(/:/g, "");
  const titleId = `k-ov-t-${uid}`, descId = `k-ov-d-${uid}`;
  const close = useRef(onClose);
  close.current = onClose;

  // Scroll lock, Escape, focus trap and focus return.
  useEffect(() => {
    if (!open || !mounted || !ready) return;
    const el = panel.current;
    if (!el) return;
    const before = document.activeElement as HTMLElement | null;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const first = el.querySelector<HTMLElement>("[data-autofocus], [autofocus]") ?? focusables(el.querySelector<HTMLElement>("[data-k-body]") ?? el)[0] ?? focusables(el)[0] ?? el;
    first.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close.current(); return; }
      if (e.key !== "Tab") return;
      const list = focusables(el);
      if (!list.length) { e.preventDefault(); el.focus(); return; }
      const a = list[0], z = list[list.length - 1], cur = document.activeElement as HTMLElement | null;
      if (!cur || !el.contains(cur)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
      else if (e.shiftKey && (cur === a || cur === el)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && cur === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.documentElement.style.overflow = prevOverflow;
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [open, mounted, ready]);

  if (!ready || !mounted) return null;
  return createPortal(
    <div className={cn("k-layer", `k-layer--${kind}`)} data-state={state} data-k-overlay="">
      <div className="k-backdrop" aria-hidden onPointerDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }} onClick={(e) => { if (closeOnBackdrop && downOnBackdrop.current && e.target === e.currentTarget) onClose(); downOnBackdrop.current = false; }} />
      <div className={cn("k-panel", `k-panel--${kind}`, panelClass)} style={panelStyle} ref={panel} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label} aria-describedby={description ? descId : undefined} tabIndex={-1} data-state={state}>
        <span className="k-panel__handle" aria-hidden />
        {title || description || eyebrow || !hideClose ? (
          <header className={cn("k-panel__head", image && "k-panel__head--image")}>
            {image ? <>{/* eslint-disable-next-line @next/next/no-img-element -- panel photo */}<img className="k-panel__img" src={image} alt="" decoding="async" /><span className="k-panel__scrim" aria-hidden /></> : null}
            <div className="k-panel__heading">
              {eyebrow ? <p className="k-panel__eyebrow">{eyebrow}</p> : null}
              {title ? <h2 className="k-panel__title" id={titleId}>{title}</h2> : null}
              {description ? <p className="k-panel__desc" id={descId}>{description}</p> : null}
            </div>
            {hideClose ? null : <button type="button" className="k-panel__close" aria-label="Close" onClick={onClose}><X size={20} strokeWidth={1.25} /></button>}
          </header>
        ) : null}
        <div className={cn("k-panel__body", flush && "k-panel__body--flush")} data-k-body="">{children}</div>
        {footer ? <footer className="k-panel__foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}

/** The design's modal (k-layer--modal): centred on desktop, a bottom sheet on phones. */
export function Modal({ size = "md", width, className, ...rest }: Props & { size?: "sm" | "md" | "lg" | "xl"; width?: number }) {
  return <Layer {...rest} kind="modal" panelClass={cn(`k-panel--${size}`, rest.image && "k-panel--photo", className)} panelStyle={width ? ({ "--k-modal-w": `${width}px` } as React.CSSProperties) : undefined} />;
}

/** The design's drawer (k-layer--drawer), from the right unless `side="left"`. */
export function Drawer({ side = "right", width = 480, className, ...rest }: Props & { side?: "left" | "right"; width?: number }) {
  return <Layer {...rest} kind="drawer" panelClass={cn(`k-panel--${side}`, rest.image && "k-panel--photo", className)} panelStyle={{ "--k-drawer-w": `${width}px` } as React.CSSProperties} />;
}

/** Placeholder bars while something loads (k-skel). */
export function Skeleton({ width, height = 16, radius = 8, className, style }: { width?: number | string; height?: number | string; radius?: number; className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={cn("k-skel", className)} style={{ width, height, borderRadius: radius, ...style }} />;
}

/** The design's empty state (k-empty): a short rule or an icon, a title, a line, an action. */
export function Empty({ title, text, action, icon, className, align = "start" }: { title: React.ReactNode; text?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode; className?: string; align?: "start" | "center" }) {
  return (
    <div className={cn("k-empty", align === "center" && "k-empty--center", className)}>
      {icon ? <div className="k-empty__icon" aria-hidden>{icon}</div> : <span className="k-empty__rule" aria-hidden />}
      <h3 className="k-empty__title">{title}</h3>
      {text ? <p className="k-empty__text">{text}</p> : null}
      {action ? <div className="k-empty__action">{action}</div> : null}
    </div>
  );
}
