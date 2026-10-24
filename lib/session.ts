import { auth, type Member } from "@/lib/api/client";
import { DEMO } from "@/lib/demo/mode";

/**
 * The real session lives in HttpOnly cookies set by /api/auth/* (see lib/api/server.ts).
 * Client code can only see the readable `ak_in` flag, plus a copy of the member's display details for the UI.
 */
export const SESSION_KEY = "artelia-connect:session";

export function isSignedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === "ak_in=1");
}

/** Demo mode only: sign straight in as the sample member, without a form. */
export async function previewAsGuest() {
  if (!DEMO) return false;
  const r = await auth<{ user?: Member }>("guest");
  if (r.ok && r.data.user) rememberMember(r.data.user);
  return r.ok;
}

/** Keeps the member's name and email for screens that greet them. Never holds tokens. */
export function rememberMember(user: Partial<Member> & Record<string, unknown>, extra: Record<string, unknown> = {}) {
  try {
    sessionStorage.removeItem("ak:me"); // the app frame reloads the member (a different account may have signed in)
    const prev = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || prev.name || String(user.email ?? "").split("@")[0];
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, id: user.id, email: user.email, name, ...extra }));
  } catch {
    /* storage unavailable: greetings fall back to defaults */
  }
}

export function rememberChoices(extra: Record<string, unknown>) {
  try {
    const prev = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...extra }));
  } catch {}
}

export async function signOut() {
  await auth("logout");
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("ak:me");
  } catch {}
}
