"use client";

import { useLocal } from "@/lib/useLocal";

/**
 * The product design's connection settings. They shape suggestions in Community Home and Create AI and are kept
 * on this device until the API stores them (no endpoint yet).
 */
export type ConnectionPrefs = {
  interests: string[];
  suggestCircles: boolean;
  useTimes: boolean;
  useIntention: boolean;
  showReason: boolean;
  showProfile: boolean;
  showCollabs: boolean;
  showActive: boolean;
  invitePolicy: number;
  ways: string[];
  free: string[];
  remind: boolean;
  quietWhenBusy: boolean;
};
const DEFAULTS: ConnectionPrefs = {
  interests: ["Community health", "Making and craft", "Food systems"],
  suggestCircles: true, useTimes: true, useIntention: true, showReason: true,
  showProfile: true, showCollabs: false, showActive: false, invitePolicy: 1,
  ways: ["Short catch-ups", "Making something together", "Quiet company"], free: ["Evenings", "Weekends"],
  remind: true, quietWhenBusy: false,
};
export function useConnectionPrefs() {
  const [prefs, setPrefs] = useLocal<ConnectionPrefs>("ak:connection-prefs", DEFAULTS);
  const [saved, setSaved] = useLocal<string | null>("ak:connection-saved", null);
  const p = { ...DEFAULTS, ...prefs };
  return {
    prefs: p,
    set: (c: Partial<ConnectionPrefs>) => { setSaved(null); setPrefs({ ...p, ...c }); },
    saved,
    save: (which: string) => setSaved(which),
  };
}
export const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
