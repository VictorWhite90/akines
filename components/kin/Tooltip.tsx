"use client";

import { cloneElement, useEffect, useId, useState } from "react";

/** The design's tooltip (k-tip): a dark pill under (or over) its trigger on hover and keyboard focus, kept on screen. */
export default function Tooltip({ label, children, describe = true, side = "bottom" }: { label: string; children: React.ReactElement<{ "aria-describedby"?: string }>; describe?: boolean; side?: "bottom" | "top" }) {
  const id = useId();
  const [off, setOff] = useState(false);
  useEffect(() => {
    if (!off) return;
    const host = document.getElementById(id)?.parentElement;
    const on = () => setOff(false);
    host?.addEventListener("pointerleave", on);
    host?.addEventListener("focusout", on);
    return () => { host?.removeEventListener("pointerleave", on); host?.removeEventListener("focusout", on); };
  }, [off, id]);
  const place = (e: React.SyntheticEvent<HTMLSpanElement>) => {
    const host = e.currentTarget;
    const pill = host.querySelector<HTMLElement>(".k-tip__pill");
    if (!pill) return;
    const r = host.getBoundingClientRect();
    const want = r.left + r.width / 2 - pill.offsetWidth / 2;
    const vw = document.documentElement.clientWidth;
    const got = Math.max(8, Math.min(want, vw - 8 - pill.offsetWidth));
    host.style.setProperty("--k-tip-shift", `${Math.round(got - want)}px`);
  };
  const trigger = describe ? cloneElement(children, { "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" ") }) : children;
  return (
    <span className="k-tip" data-side={side} data-off={off || undefined} onPointerEnter={place} onFocus={place} onKeyDown={(e) => e.key === "Escape" && setOff(true)}>
      {trigger}
      <span className="k-tip__pill" role="tooltip" id={id}>{label}</span>
    </span>
  );
}
