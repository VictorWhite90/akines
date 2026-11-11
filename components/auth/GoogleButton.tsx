"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO } from "@/lib/demo/mode";
import { GOOGLE_CLIENT_ID, loadGoogle, receiveGoogleCredential, type GoogleId } from "@/lib/google";
import { Provider } from "./parts";
import "./google.css";

/** Google draws its button 200 to 400 px wide and 40 px tall (size "large"). */
const GIS_MIN = 200;
const GIS_MAX = 400;
const GIS_HEIGHT = 40;

/**
 * The design's "Continue with Google" button, working through Google Identity Services (GIS).
 *
 * GIS only hands out a credential from a press on Google's own button (or its One Tap prompt, which browsers may
 * hide). So Google's button is drawn at our button's size and laid over it, invisible: the page keeps the design's
 * look (hover and focus are mirrored onto ours) and every press reaches Google directly. The script loads when this
 * button appears, only when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set; until it's ready a press says why nothing happened.
 * Keyboard users tab to Google's button (it's labelled by Google); ours is then inert.
 *
 * Demo mode: no Google at all; a press hands over a placeholder credential (the demo signs in as the guest).
 */
export default function GoogleButton({ onCredential, onNotice, unavailable, busy, label }: {
  /** The ID token from Google, to send to /api/auth/google (or profile/google). */
  onCredential: (credential: string) => void;
  /** A message for the design's helper text: not set up, still loading, or Google couldn't be reached. */
  onNotice: (message: string) => void;
  /** What to say when Google sign-in isn't set up for this build. */
  unavailable: string;
  busy?: boolean;
  label?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const handler = useRef(onCredential);
  const [gis, setGis] = useState<GoogleId | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const enabled = !DEMO && !!GOOGLE_CLIENT_ID;

  useEffect(() => { handler.current = onCredential; }, [onCredential]);

  // Load GIS when the button is on screen, and hand its credentials to whoever rendered this button.
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const stop = receiveGoogleCredential((credential) => handler.current(credential));
    void loadGoogle().then((id) => {
      if (!live) return;
      if (id) setGis(id);
      else setFailed(true);
    });
    return () => { live = false; stop(); };
  }, [enabled, attempt]);

  // Draw Google's button at our button's size, and again when that size changes.
  useEffect(() => {
    const el = box.current, target = slot.current;
    if (!gis || !el || !target) return;
    let drawn = 0;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const w = Math.round(Math.min(GIS_MAX, Math.max(GIS_MIN, width)));
      if (w !== drawn) {
        target.replaceChildren();
        gis.renderButton(target, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", logo_alignment: "left", width: w });
        drawn = w;
      }
      target.style.transform = `scale(${width / w}, ${height / GIS_HEIGHT})`;
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(el);
    return () => watch.disconnect();
  }, [gis]);

  /** A press on our button: only reached while Google's isn't laid over it. */
  const press = () => {
    if (DEMO) return onCredential("demo");
    if (!GOOGLE_CLIENT_ID) return onNotice(unavailable);
    if (failed) {
      setFailed(false);
      setAttempt((n) => n + 1);
      return onNotice("We couldn't reach Google. Check your connection and try again.");
    }
    onNotice("Google is still loading. Try again in a moment.");
  };

  const ready = !!gis && !busy;
  return (
    <div ref={box} className="au-gis" data-ready={ready ? "" : undefined}>
      <div className="au-gis__face" inert={ready}>
        <Provider provider="google" label={label} loading={busy} onClick={press} />
      </div>
      {enabled ? <div className="au-gis__slot" aria-hidden={ready ? undefined : true}><div ref={slot} className="au-gis__google" /></div> : null}
    </div>
  );
}
