/** Prototype session: the auth flow saves the member's details here. Django will replace this with real auth. */
export const SESSION_KEY = "artelia-connect:session";

export function isSignedIn(): boolean {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
    return Boolean(s.email || s.guest);
  } catch {
    return false;
  }
}

export function startGuest() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ guest: true, name: "Guest" }));
  } catch {}
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
