"use client";

import { Monitor, Moon, Sun1 } from "iconsax-reactjs";
import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "ak:theme";
const NEXT: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };
const LABEL: Record<Mode, string> = { light: "Light mode", dark: "Dark mode", system: "Match my device" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Cycles light → dark → match device. Remembered per browser. */
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    let saved: Mode = "light";
    try {
      saved = (localStorage.getItem(KEY) as Mode) || "light";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved choice once on mount
    setMode(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if ((localStorage.getItem(KEY) ?? "light") === "system") apply("system");
      } catch {}
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const next = NEXT[mode];
    setMode(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    apply(next);
  };

  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun1;
  return (
    <button className="nx-icon" onClick={cycle} aria-label={`${LABEL[mode]}. Switch to ${LABEL[NEXT[mode]].toLowerCase()}`} title={LABEL[mode]}>
      <Icon size={20} color="currentColor" variant={mode === "dark" ? "Bold" : "Linear"} />
    </button>
  );
}
