"use client";

import { useEffect, useState } from "react";

const KIN = ["#ffb000", "#e5007e", "#00a86b", "#2547d0", "#ff6b1a"];
const KEY = "ak:splashed";
const LENGTH = 3200;

/**
 * The Akines launch moment, once per browser session: five kin dots fly in from the edges,
 * orbit, gather into a circle, collapse into the mark, and the name rises. Tap to skip.
 */
export default function Splash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {}
    if (seen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decided once, on first paint of the session
    setShow(true);
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setLeaving(true), quick ? 600 : LENGTH);
    const t2 = setTimeout(() => setShow(false), (quick ? 600 : LENGTH) + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;
  const skip = () => {
    setLeaving(true);
    setTimeout(() => setShow(false), 500);
  };

  return (
    <div className={`sp${leaving ? " out" : ""}`} onClick={skip} role="presentation" aria-label="Akines is opening">
      <div className="sp-stage">
        <span className="sp-ring" aria-hidden />
        <span className="sp-ring r2" aria-hidden />
        <span className="sp-orbit" aria-hidden>
          {KIN.map((c, i) => (
            <i key={c} style={{ ["--c" as string]: c, ["--i" as string]: i } as React.CSSProperties} />
          ))}
        </span>
        <span className="sp-core" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny brand mark, must paint instantly */}
          <img src="/akines/mark.png" alt="" />
        </span>
      </div>
      <h1 className="sp-word" aria-label="Akines">
        {"AKINES".split("").map((ch, i) => <span key={i} style={{ ["--d" as string]: `${1.9 + i * 0.06}s` } as React.CSSProperties}>{ch}</span>)}
      </h1>
      <p className="sp-tag">Less scrolling. More belonging.</p>
    </div>
  );
}
