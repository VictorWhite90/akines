"use client";

import { useState } from "react";
import Button from "./Button";

/** A button that flips between two states, for join / apply / book / follow-up actions. */
export default function ToggleButton({ idle, done, variant = "primary", doneVariant = "soft", size = "md", className }: { idle: string; done: string; variant?: "primary" | "gold" | "clay" | "ghost" | "soft"; doneVariant?: "primary" | "gold" | "clay" | "ghost" | "soft"; size?: "sm" | "md" | "lg"; className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <Button variant={on ? doneVariant : variant} size={size} className={className} onClick={() => setOn((v) => !v)} aria-pressed={on}>
      {on ? <><span aria-hidden>✓</span> {done}</> : idle}
    </Button>
  );
}
