// Server-only: imported by route handlers under app/api. Never import from client components.
import type { NextRequest, NextResponse } from "next/server";

/**
 * Server-side half of the API layer (the "backend for frontend").
 * The browser never sees the Django tokens: Next keeps them in HttpOnly cookies and attaches them
 * when it forwards requests to Django. Page scripts cannot read them, so an injected script can't steal a session.
 */

export const DJANGO_API_URL = (process.env.AKINES_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export const COOKIE = {
  access: "ak_access",
  refresh: "ak_refresh",
  /** Readable flag so client code can tell "signed in" without seeing a token. */
  signedIn: "ak_in",
} as const;

// Mirrors SIMPLE_JWT in the Django settings (access 1 day, refresh 10 days).
const ACCESS_MAX_AGE = 60 * 60 * 24;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 10;

const secure = process.env.NODE_ENV === "production";

export type Envelope<T = unknown> = {
  success: boolean;
  message?: string | null;
  data?: T;
  error?: { field?: string; label?: string };
  meta?: Record<string, unknown>;
};

export type Tokens = { access_token?: string; refresh_token?: string };

export function setSession(res: NextResponse, tokens: Tokens) {
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  if (tokens.access_token) res.cookies.set(COOKIE.access, tokens.access_token, { ...base, maxAge: ACCESS_MAX_AGE });
  if (tokens.refresh_token) {
    res.cookies.set(COOKIE.refresh, tokens.refresh_token, { ...base, maxAge: REFRESH_MAX_AGE });
    res.cookies.set(COOKIE.signedIn, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: REFRESH_MAX_AGE });
  }
}

export function clearSession(res: NextResponse) {
  for (const name of Object.values(COOKIE)) res.cookies.set(name, "", { path: "/", maxAge: 0 });
}

/** Unsafe requests must come from our own pages (defence in depth on top of SameSite=Lax cookies). */
export function sameOrigin(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Calls Django and returns the parsed envelope. Network failures become a 503 envelope. */
export async function django<T = unknown>(path: string, init: RequestInit & { token?: string; req?: NextRequest } = {}) {
  const { token, req, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");
  if (rest.body && typeof rest.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Pass the visitor's IP on so Django's rate limits and audit log see the real client.
  const ip = req?.headers.get("x-forwarded-for") ?? req?.headers.get("x-real-ip");
  if (ip) headers.set("X-Forwarded-For", ip);
  const ua = req?.headers.get("user-agent");
  if (ua) headers.set("User-Agent", ua);
  try {
    const r = await fetch(`${DJANGO_API_URL}/${path.replace(/^\//, "")}`, { ...rest, headers, cache: "no-store" });
    const body = (await r.json().catch(() => ({ success: false, message: "Unexpected response from the server." }))) as Envelope<T>;
    return { status: r.status, body };
  } catch {
    return { status: 503, body: { success: false, message: "We can't reach Akines right now. Check your connection and try again." } as Envelope<T> };
  }
}
