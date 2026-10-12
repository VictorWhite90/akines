"use client";

import { useState } from "react";
import { MY_DNA } from "@/lib/data";
import Toggle from "./Toggle";

/** Quick versions of the controls that live in full on /dna and /introductions (T3). */
export default function MatchingControls() {
  const [prefs, setPrefs] = useState({
    visibleToMatches: MY_DNA.privacy.visibleToMatches,
    visibleToCurators: MY_DNA.privacy.visibleToCurators,
    inferFromBehaviour: MY_DNA.privacy.inferFromBehaviour,
    paused: false,
  });
  const [message, setMessage] = useState("");

  function set<K extends keyof typeof prefs>(key: K, value: boolean, msg: string) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setMessage(msg);
  }

  return (
    <div className="flex flex-col gap-5">
      <Toggle
        label="Show my Creative DNA to people I'm introduced to"
        description="They see the dimensions you share, with labels showing which you declared and which were inferred."
        checked={prefs.visibleToMatches}
        onChange={(v) => set("visibleToMatches", v, v ? "Your matches can now see your shared Creative DNA." : "Your Creative DNA is now hidden from matches.")}
      />
      <Toggle
        label="Let verified curators find me for open calls"
        description="Only curators whose identity and professional record Artelia has checked."
        checked={prefs.visibleToCurators}
        onChange={(v) => set("visibleToCurators", v, v ? "Verified curators can find you again." : "You're hidden from curator search. Your applications are unaffected.")}
      />
      <Toggle
        label="Learn from what I do (with my consent)"
        description="Rooms you join and stories you spend time with can refine your DNA. Wellbeing activity is never included."
        checked={prefs.inferFromBehaviour}
        onChange={(v) => set("inferFromBehaviour", v, v ? "Behaviour-based suggestions are on." : "We'll only use what you've told us directly.")}
      />
      <Toggle
        label="Pause all new introductions"
        description="Take a break. Existing conversations and projects carry on as normal."
        checked={prefs.paused}
        onChange={(v) => set("paused", v, v ? "Introductions paused. Turn this off whenever you're ready." : "Introductions resumed.")}
      />
      <p aria-live="polite" className="min-h-5 text-sm font-semibold text-verified">
        {message}
      </p>
    </div>
  );
}
