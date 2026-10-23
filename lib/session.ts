import { auth, type Member } from "@/lib/api/client";

/**
 * The real session lives in HttpOnly cookies set by /api/auth/* (see lib/api/server.ts).
 * Client code can only see the readable `ak_in` flag, plus a copy of the member's display details for the UI.
 */
export const SESSION_KEY = "artelia-connect:session";

export function isGuest(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === "ak_guest=1");
}

export function isSignedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === "ak_in=1" || c === "ak_guest=1");
}

export function startGuestSession() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `ak_guest=1; Path=/; SameSite=Lax${secure}`;
  try {
    sessionStorage.removeItem("ak:me");
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable: the preview still works without saved guest details */
  }
}

/** Keeps the member's name and email for screens that greet them. Never holds tokens. */
export function rememberMember(user: Partial<Member> & Record<string, unknown>, extra: Record<string, unknown> = {}) {
  if (typeof document !== "undefined") document.cookie = "ak_guest=; Max-Age=0; Path=/; SameSite=Lax";
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
  const guest = isGuest();
  if (!guest) await auth("logout");
  if (typeof document !== "undefined") document.cookie = "ak_guest=; Max-Age=0; Path=/; SameSite=Lax";
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("ak:me");
  } catch {}
}
