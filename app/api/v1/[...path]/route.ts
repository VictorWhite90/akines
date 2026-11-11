import { NextResponse, type NextRequest } from "next/server";
import {
  clearSession,
  COOKIE,
  django,
  MAX_JSON_BYTES,
  MAX_UPLOAD_BYTES,
  readBodyCapped,
  refreshTokens,
  sameOrigin,
  setSession,
  UPLOAD_TIMEOUT_MS,
} from "@/lib/api/server";

/**
 * Same-origin gateway to the Django API: /api/v1/<path> → <AKINES_API_URL>/<path>, with the member's token attached.
 * When the access token has expired it refreshes (once per refresh token, shared by parallel requests) and retries.
 */
async function forward(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ success: false, message: "Request blocked." }, { status: 403 });
  const { path } = await params;
  if (path[0] === "auth") return NextResponse.json({ success: false, message: "Use /api/auth/*." }, { status: 404 });

  // Keep a trailing slash exactly as the caller wrote it: Django routes depend on it.
  const slash = req.nextUrl.pathname.endsWith("/") ? "/" : "";
  const target = path.map(encodeURIComponent).join("/") + slash + req.nextUrl.search;
  // File uploads (multipart) are forwarded byte for byte with their boundary; everything else is JSON text.
  const contentType = req.headers.get("content-type") ?? "";
  const multipart = contentType.startsWith("multipart/form-data");

  let body: ArrayBuffer | string | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    const read = await readBodyCapped(req, multipart ? MAX_UPLOAD_BYTES : MAX_JSON_BYTES);
    if (!read.ok) {
      const message = read.status === 413 ? (multipart ? "That file is too large." : "That request is too large.") : "The request couldn't be read.";
      return NextResponse.json({ success: false, message }, { status: read.status });
    }
    body = multipart ? read.body : new TextDecoder().decode(read.body);
  }
  const headers = multipart ? { "Content-Type": contentType } : undefined;
  const timeoutMs = multipart ? UPLOAD_TIMEOUT_MS : undefined;
  const send = (token?: string) => django(target, { method: req.method, body, headers, token, req, timeoutMs });

  let access = req.cookies.get(COOKIE.access)?.value;
  const refresh = req.cookies.get(COOKIE.refresh)?.value;
  let refreshed: Awaited<ReturnType<typeof refreshTokens>> | undefined;

  if (!access && refresh) {
    refreshed = await refreshTokens(refresh, req);
    access = refreshed.tokens?.access_token;
  }
  let result = await send(access);
  if (result.status === 401 && refresh && !refreshed) {
    refreshed = await refreshTokens(refresh, req);
    if (refreshed.tokens?.access_token) result = await send(refreshed.tokens.access_token);
  }

  const res = NextResponse.json(result.body, { status: result.status });
  if (refreshed?.tokens?.access_token) setSession(res, refreshed.tokens);
  // The session ends only when Django refused the refresh token itself. Django being slow or unreachable
  // (503/504) keeps the cookies, so a hiccup never signs anyone out.
  else if (refreshed?.rejected) clearSession(res);
  return res;
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
