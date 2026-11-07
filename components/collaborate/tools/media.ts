"use client";

import { useSyncExternalStore } from "react";

/*
 * Your camera, microphone and shared screen during a meeting, as the product design handles them: one store for
 * the lobby and the call, so the preview carries into the call. It asks the browser once; if you say no, or there
 * is no camera, the tiles fall back to your photo or initials and a note asks you to allow them.
 * Everything stays on this device: the streams only feed your own preview. Nothing is recorded or sent.
 * The tracks stop when you leave the meeting screens (a short grace lets the lobby hand over to the call).
 */

export const SCREEN_NOTE = "Screen sharing did not start. Allow screen capture to present here.";

export type Media = {
  phase: "idle" | "requesting" | "ready" | "blocked";
  stream: MediaStream | null;
  hasMic: boolean;
  hasCam: boolean;
  /** What you asked for; the tracks follow when the browser allows them. */
  micOn: boolean;
  camOn: boolean;
  screen: MediaStream | null;
  screenNote: string | null;
  joinedAt: number | null;
};

const INITIAL: Media = { phase: "idle", stream: null, hasMic: false, hasCam: false, micOn: true, camOn: true, screen: null, screenNote: null, joinedAt: null };
let state = INITIAL;
const subs = new Set<() => void>();
const set = (p: Partial<Media>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
let mic: MediaStreamTrack | null = null;
let cam: MediaStreamTrack | null = null;
/** Bumped on every stop, so a permission answer that arrives after you left is thrown away. */
let generation = 0;
let grace: ReturnType<typeof setTimeout> | undefined;
/** How long you were in the last call, for the "you left" screen. */
let lastCall: { projectId: string; minutes: number } | null = null;

const devices = () => (typeof navigator === "undefined" ? undefined : navigator.mediaDevices);
const stopStream = (s: MediaStream) => s.getTracks().forEach((t) => t.stop());

function publish(extra: Partial<Media> = {}) {
  const tracks = [mic, cam].filter((t): t is MediaStreamTrack => !!t);
  let stream: MediaStream | null = null;
  try { stream = tracks.length ? new MediaStream(tracks) : null; } catch { stream = null; }
  set({ stream, hasMic: !!mic, hasCam: !!cam, ...extra });
}

function adopt(s: MediaStream) {
  const a = s.getAudioTracks()[0], v = s.getVideoTracks()[0];
  if (a) { mic?.stop(); mic = a; a.enabled = state.micOn; a.addEventListener("ended", () => { if (mic === a) { mic = null; publish(); } }); }
  if (v) { cam?.stop(); cam = v; v.addEventListener("ended", () => { if (cam === v) { cam = null; publish(); } }); }
}

async function ask(md: MediaDevices, c: MediaStreamConstraints): Promise<MediaStream | string> {
  try { return await md.getUserMedia(c); } catch (e) { return (e as { name?: string })?.name ?? "Error"; }
}

async function acquire() {
  if (state.phase === "requesting") return;
  const md = devices();
  if (!md || typeof md.getUserMedia !== "function") { set({ phase: "blocked" }); return; }
  const wantMic = !mic, wantCam = state.camOn && !cam;
  if (!wantMic && !wantCam) { set({ phase: mic || cam ? "ready" : "blocked" }); return; }
  const gen = generation;
  set({ phase: "requesting" });
  const got: MediaStream[] = [];
  const both = await ask(md, { audio: wantMic, video: wantCam });
  if (typeof both !== "string") got.push(both);
  else if (wantMic && wantCam && both !== "NotAllowedError" && both !== "SecurityError") {
    // One device may be missing or busy: try each on its own.
    const v = await ask(md, { video: true }); if (typeof v !== "string") got.push(v);
    const a = await ask(md, { audio: true }); if (typeof a !== "string") got.push(a);
  }
  if (gen !== generation) { got.forEach(stopStream); return; }
  got.forEach(adopt);
  publish({ phase: mic || cam ? "ready" : "blocked" });
}

export const media = {
  get: () => state,
  /** Ask for the camera and microphone (once, unless `again`). */
  request(again = false) { return state.phase === "requesting" || (!again && state.phase !== "idle") ? Promise.resolve() : acquire(); },
  toggleMic() {
    if (mic) { const on = !state.micOn; mic.enabled = on; set({ micOn: on }); return; }
    set({ micOn: true }); void acquire();
  },
  toggleCam() {
    if (cam && state.camOn) { const t = cam; cam = null; t.stop(); publish({ camOn: false }); return; }
    set({ camOn: true }); void acquire();
  },
  async present() {
    if (state.screen) return true;
    const md = devices();
    if (!md || typeof md.getDisplayMedia !== "function") { set({ screenNote: SCREEN_NOTE }); return false; }
    const gen = generation;
    try {
      const s = await md.getDisplayMedia({ video: true, audio: false });
      const v = s.getVideoTracks()[0];
      if (!v || gen !== generation) { stopStream(s); if (!v) set({ screenNote: SCREEN_NOTE }); return false; }
      v.addEventListener("ended", () => { if (state.screen === s) media.stopPresenting(); });
      set({ screen: s, screenNote: null });
      return true;
    } catch {
      set({ screenNote: SCREEN_NOTE });
      return false;
    }
  },
  stopPresenting() { if (state.screen) stopStream(state.screen); set({ screen: null }); },
  clearScreenNote() { if (state.screenNote) set({ screenNote: null }); },
  markJoined() { if (state.joinedAt == null) set({ joinedAt: Date.now() }); },
  /** Leave: note how long you were in, then stop everything. */
  leave(projectId: string) {
    lastCall = { projectId, minutes: state.joinedAt == null ? 0 : Math.max(1, Math.round((Date.now() - state.joinedAt) / 60000)) };
    media.stopAll();
  },
  lastCall: (projectId: string) => (lastCall?.projectId === projectId && lastCall.minutes > 0 ? lastCall.minutes : null),
  stopAll() {
    generation += 1;
    clearTimeout(grace); grace = undefined;
    mic?.stop(); cam?.stop(); mic = null; cam = null;
    if (state.screen) stopStream(state.screen);
    state = INITIAL; subs.forEach((f) => f());
  },
  /** A meeting screen mounted: keep the devices. */
  screenShown() { clearTimeout(grace); grace = undefined; },
  /** A meeting screen unmounted: stop unless another one takes over. */
  screenGone() { clearTimeout(grace); grace = setTimeout(() => media.stopAll(), 600); },
};

export function useMedia() {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => state, () => INITIAL);
}
