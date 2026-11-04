"use client";

import Link from "next/link";
import { Fragment, useEffect } from "react";
import Button from "./Button";
import Logo from "./Logo";

const HEADLINE = ["This", "connection", null, "has", "not", "been", "made", "yet."] as const;

/** Page not found, mirrored from the product design (classes in components/kin/akines/notfound.css). */
export default function NotFound() {
  // The photo drifts a little against the pointer, on fine pointers and only with motion allowed.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".nf");
    if (!el) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, x = 0, y = 0;
    const paint = () => { raf = 0; el.style.setProperty("--mx", x.toFixed(3)); el.style.setProperty("--my", y.toFixed(3)); };
    const move = (e: PointerEvent) => { x = (e.clientX / innerWidth) * 2 - 1; y = (e.clientY / innerHeight) * 2 - 1; if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener("pointermove", move, { passive: true });
    return () => { removeEventListener("pointermove", move); if (raf) cancelAnimationFrame(raf); };
  }, []);

  let wi = 0;
  return (
    <div className="nf">
      <div className="nf__parallax">
        <picture className="nf__media">
          <source media="(min-width: 768px)" srcSet="/kin/notfound/notfound.jpg" />
          <img alt="Two hands reaching toward each other, almost touching, in warm evening light" sizes="100vw" loading="eager" decoding="async" className="cover nf__img" src="/kin/notfound/notfound-portrait.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </picture>
      </div>
      <div className="nf__scrim" aria-hidden />
      <header className="nf__header">
        <Link href="/" className="nf__logo" aria-label="Akines, back to the home page"><Logo /></Link>
      </header>
      <main className="nf__content">
        <p className="nf__eyebrow"><span className="nf__rule nf__rule--l" aria-hidden /><span>Error 404</span><span className="nf__rule nf__rule--r" aria-hidden /></p>
        <h1 className="nf__headline">
          {HEADLINE.map((w, i) => (w === null ? <br key={i} className="lb" /> : <Fragment key={i}><span className="w" style={{ ["--wi" as string]: wi++ } as React.CSSProperties}>{w}</span>{" "}</Fragment>))}
        </h1>
        <p className="nf__body">The page you are looking for may have moved, or it is still being built. Let’s take you back to where belonging begins.</p>
        <div className="nf__actions"><Button href="/" size="xl" light fluid>Return home</Button></div>
      </main>
    </div>
  );
}
