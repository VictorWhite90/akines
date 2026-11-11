/**
 * Continue with Google, browser side: Google Identity Services (GIS) gives us an ID token (the "credential"), which
 * our server sends to the API (/api/auth/google). No OAuth redirect and no client secret are involved.
 *
 * The script (https://accounts.google.com/gsi/client) is loaded only when a Google button is on screen and only when
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is set (build time). Without it, the buttons say Google isn't available yet.
 */
import { DEMO } from "@/lib/demo/mode";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
/** Google sign-in works here: a client ID is set, or the demo (where it signs in as the demo guest). */
export const GOOGLE_ENABLED = DEMO || !!GOOGLE_CLIENT_ID;

const GIS_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential?: string; select_by?: string };
type ButtonOptions = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
};
export type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
    ux_mode?: "popup" | "redirect";
    itp_support?: boolean;
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: ButtonOptions) => void;
  cancel: () => void;
  disableAutoSelect: () => void;
};
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
  }
}

let loading: Promise<GoogleId | null> | null = null;
/** Who gets the next credential: the Google button currently on screen (GIS has one callback per page). */
let receiver: ((credential: string) => void) | null = null;
let initialised = false;

/** Loads GIS once and initialises it. Resolves to null when it can't be used (no client ID, blocked, offline). */
export function loadGoogle(): Promise<GoogleId | null> {
  if (typeof window === "undefined" || DEMO || !GOOGLE_CLIENT_ID) return Promise.resolve(null);
  if (window.google?.accounts?.id) return Promise.resolve(init(window.google.accounts.id));
  if (loading) return loading;
  loading = new Promise<GoogleId | null>((resolve) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.accounts?.id ? init(window.google.accounts.id) : null);
    script.onerror = () => {
      script.remove();
      loading = null; // a later press may try again (e.g. back online)
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

function init(id: GoogleId): GoogleId {
  if (initialised) return id;
  initialised = true;
  id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => { if (response.credential) receiver?.(response.credential); },
    auto_select: false,
    cancel_on_tap_outside: true,
    ux_mode: "popup",
    itp_support: true,
    use_fedcm_for_button: true,
  });
  return id;
}

/** Sends GIS credentials to `fn` until the returned function is called. */
export function receiveGoogleCredential(fn: (credential: string) => void) {
  receiver = fn;
  return () => { if (receiver === fn) receiver = null; };
}

/**
 * Hand-offs between the sign-in panel and Join (kept in this tab's sessionStorage, read once, never in the URL):
 * - "signup": a new person continued with Google on the sign-in panel; Join picks up at "Make it yours."
 * - "2fa": a two-step member continued with Google on Join; the sign-in panel asks for the code.
 */
export type GoogleSignup = { signup_token: string; email: string; suggested_username?: string | null; first_name?: string };
export type GoogleTwoStep = { mfa_token: string; identifier: string };
type Handoff = { signup: GoogleSignup; "2fa": GoogleTwoStep };
const HANDOFF_KEY = "ak:google";

export function handOff<K extends keyof Handoff>(kind: K, data: Handoff[K]) {
  try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ kind, data, at: Date.now() })); } catch { /* storage off: the person presses Google again */ }
}

/**
 * Taken from storage once, then kept for this page load: the page's loading fallback and the page itself both mount
 * the same screen, and both must see it. handoffDone() forgets it once it has been used.
 */
const taken: { [K in keyof Handoff]?: { data: Handoff[K]; at: number } } = {};
const HANDOFF_MS = 10 * 60 * 1000; // the API's tokens last 10 to 15 minutes; an older hand-off would only fail

export function takeHandoff<K extends keyof Handoff>(kind: K): Handoff[K] | null {
  const kept = taken[kind] as { data: Handoff[K]; at: number } | undefined;
  if (kept) return Date.now() - kept.at < HANDOFF_MS ? kept.data : null;
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { kind: string; data: Handoff[K]; at: number };
    if (saved.kind !== kind) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    (taken as Record<string, unknown>)[kind] = { data: saved.data, at: saved.at };
    return Date.now() - saved.at < HANDOFF_MS ? saved.data : null;
  } catch {
    return null;
  }
}

/** The hand-off was used (account created, code confirmed) or abandoned: a later visit starts afresh. */
export function handoffDone(kind: keyof Handoff) {
  delete taken[kind];
}
