// Server-only: imported by route handlers under app/api. Never import from client components.
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Server-side half of the API layer (the "backend for frontend").
 * The browser never sees the Django tokens: Next keeps them in HttpOnly cookies and attaches them
 * when it forwards requests to Django. Page scripts cannot read them, so an injected script can't steal a session.
 */

export const DJANGO_API_URL = (process.env.AKINES_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

/** How long one call to Django may take before the visitor gets a 504 (uploads get longer). */
const TIMEOUT_MS = Number(process.env.AKINES_API_TIMEOUT_MS ?? 15_000);
export const UPLOAD_TIMEOUT_MS = Number(process.env.AKINES_API_UPLOAD_TIMEOUT_MS ?? 60_000);

/** Largest bodies the gateway reads: files (multipart) and everything else (JSON). */
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_JSON_BYTES = 1024 * 1024;

export const COOKIE = {
  access: "ak_access",
  refresh: "ak_refresh",
  /** Readable flag so client code can tell "signed in" without seeing a token. */
  signedIn: "ak_in",
} as const;

// Used only when a token carries no readable expiry: Django's defaults (access 30 minutes, refresh 10 days).
const FALLBACK_ACCESS_SECONDS = 30 * 60;
const FALLBACK_REFRESH_SECONDS = 60 * 60 * 24 * 10;

const secure = process.env.NODE_ENV === "production";

export type Envelope<T = unknown> = {
  success: boolean;
  message?: string | null;
  data?: T;
  error?: { field?: string; label?: string };
  meta?: Record<string, unknown>;
};

export type Tokens = { access_token?: string; refresh_token?: string };

/** Seconds until a JWT's `exp` (read, not verified: Django verifies). Undefined when it can't be read. */
export function secondsUntilExpiry(token: string): number | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")) as { exp?: unknown };
    if (typeof payload.exp !== "number") return undefined;
    return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return undefined;
  }
}

/** Each cookie lives exactly as long as its token, so an expired access token is never sent. */
export function setSession(res: NextResponse, tokens: Tokens) {
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  if (tokens.access_token) {
    const maxAge = secondsUntilExpiry(tokens.access_token) ?? FALLBACK_ACCESS_SECONDS;
    res.cookies.set(COOKIE.access, tokens.access_token, { ...base, maxAge });
  }
  if (tokens.refresh_token) {
    const maxAge = secondsUntilExpiry(tokens.refresh_token) ?? FALLBACK_REFRESH_SECONDS;
    res.cookies.set(COOKIE.refresh, tokens.refresh_token, { ...base, maxAge });
    res.cookies.set(COOKIE.signedIn, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge });
  }
}

export function clearSession(res: NextResponse) {
  for (const name of Object.values(COOKIE)) res.cookies.set(name, "", { path: "/", maxAge: 0, secure, sameSite: "lax" });
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

/**
 * The visitor's address as our nginx saw it. nginx overwrites X-Forwarded-For with the socket address, so the last
 * entry is the one we trust; anything a browser sent itself never reaches Django. Django counts exactly one hop
 * (TRUSTED_PROXY_COUNT=1), the same as for the mobile app going through nginx straight to the API.
 */
export function clientIp(req?: NextRequest): string | undefined {
  const chain = req?.headers.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  const ip = chain.at(-1) ?? req?.headers.get("x-real-ip")?.trim();
  return ip && isIP(ip) ? ip : undefined;
}

export type BodyResult = { ok: true; body: ArrayBuffer } | { ok: false; status: 413 | 400 };

/** Reads a request body, stopping as soon as it passes `limit` bytes (a missing or false Content-Length included). */
export async function readBodyCapped(req: NextRequest, limit: number): Promise<BodyResult> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > limit) return { ok: false, status: 413 };
  if (!req.body) return { ok: true, body: new ArrayBuffer(0) };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, body: out.buffer };
}

/** Calls Django and returns the parsed envelope. Network failures become a 503 envelope, a slow answer a 504. */
export async function django<T = unknown>(
  path: string,
  init: RequestInit & { token?: string; req?: NextRequest; timeoutMs?: number } = {},
) {
  const { token, req, timeoutMs, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");
  if (rest.body && typeof rest.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // One address, the visitor's (see clientIp), so Django's rate limits and audit log see the real client.
  const ip = clientIp(req);
  if (ip) headers.set("X-Forwarded-For", ip);
  const proto = req?.headers.get("x-forwarded-proto");
  if (proto === "https" || proto === "http") headers.set("X-Forwarded-Proto", proto);
  const ua = req?.headers.get("user-agent");
  if (ua) headers.set("User-Agent", ua);
  try {
    const r = await fetch(`${DJANGO_API_URL}/${path.replace(/^\//, "")}`, {
      ...rest,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs ?? TIMEOUT_MS),
    });
    const body = (await r.json().catch(() => ({ success: false, message: "Unexpected response from the server." }))) as Envelope<T>;
    return { status: r.status, body };
  } catch (e) {
    if (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError")) {
      return { status: 504, body: { success: false, message: "Akines is taking too long to answer. Try again in a moment." } as Envelope<T> };
    }
    return { status: 503, body: { success: false, message: "We can't reach Akines right now. Check your connection and try again." } as Envelope<T> };
  }
}

/** tokens: the new pair; rejected: Django refused the refresh token (401/403), as opposed to being unreachable. */
export type Refreshed = { tokens?: { access_token?: string; refresh_token?: string }; rejected: boolean };

// Refreshes in flight, and just finished, per refresh token (hashed: the map never holds a usable token as a key).
const refreshing = new Map<string, Promise<Refreshed>>();
const REUSE_MS = 20_000;

/**
 * Exchanges a refresh token for a new pair, once per token however many requests ask at the same moment.
 * Refresh tokens rotate (the old one stops working), so a page that fires several calls with an expired access token
 * must not refresh several times: every caller shares the first refresh's result for a few seconds. Across several
 * web servers, Django itself hands back the same new pair for a short grace period (REFRESH_REUSE_GRACE_SECONDS).
 */
export function refreshTokens(refresh: string, req: NextRequest): Promise<Refreshed> {
  const key = createHash("sha256").update(refresh).digest("hex");
  const pending = refreshing.get(key);
  if (pending) return pending;
  const run = django<{ access_token?: string; refresh_token?: string }>("auth/token/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refresh }),
    req,
  }).then(({ status, body }): Refreshed => {
    const tokens = status < 400 ? body.data : undefined;
    // Share a success for a few seconds; forget a failure at once so the next request can try again.
    if (tokens?.access_token) setTimeout(() => refreshing.delete(key), REUSE_MS);
    else refreshing.delete(key);
    return { tokens, rejected: status === 401 || status === 403 };
  });
  refreshing.set(key, run);
  return run;
}
