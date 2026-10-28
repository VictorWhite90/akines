"use client";

import { Monitor, Moon, Sun1 } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import Button from "./Button";

type Mode = "light" | "dark" | "system";
const KEY = "ak:theme";
const NEXT: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };
const LABEL: Record<Mode, string> = { light: "Light", dark: "Dark", system: "Match device" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Light, dark, match device. Same key as the legacy toggle, so the choice carries across old and new pages. */
export default function ThemeToggle({ label = false }: { label?: boolean }) {
  const [mode, setMode] = useState<Mode>("light");
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved choice once on mount
      setMode((localStorage.getItem(KEY) as Mode) || "light");
    } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { try { if ((localStorage.getItem(KEY) ?? "light") === "system") apply("system"); } catch {} };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const cycle = () => {
    const next = NEXT[mode];
    setMode(next);
    try { localStorage.setItem(KEY, next); } catch {}
    apply(next);
  };
  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun1;
  return (
    <Button variant="ghost" icon={!label} onClick={cycle} aria-label={`${LABEL[mode]} theme. Switch to ${LABEL[NEXT[mode]].toLowerCase()}`} title={LABEL[mode]}>
      <Icon size={20} color="currentColor" />
      {label && LABEL[mode]}
    </Button>
  );
}
