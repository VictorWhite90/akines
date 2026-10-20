import { NextResponse, type NextRequest } from "next/server";
import { clearSession, COOKIE, django, sameOrigin, setSession } from "@/lib/api/server";

/**
 * Same-origin gateway to the Django API: /api/v1/<path> → <AKINES_API_URL>/<path>, with the member's token attached.
 * When the access token has expired it refreshes once with the refresh token and retries.
 */
async function forward(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ success: false, message: "Request blocked." }, { status: 403 });
  const { path } = await params;
  if (path[0] === "auth") return NextResponse.json({ success: false, message: "Use /api/auth/*." }, { status: 404 });

  const target = path.map(encodeURIComponent).join("/") + req.nextUrl.search;
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();
  const send = (token?: string) => django(target, { method: req.method, body, token, req });

  let access = req.cookies.get(COOKIE.access)?.value;
  const refresh = req.cookies.get(COOKIE.refresh)?.value;
  let refreshed: { access_token?: string; refresh_token?: string } | undefined;

  if (!access && refresh) {
    refreshed = await refreshTokens(refresh, req);
    access = refreshed?.access_token;
  }
  let result = await send(access);
  if (result.status === 401 && refresh && !refreshed) {
    refreshed = await refreshTokens(refresh, req);
    if (refreshed?.access_token) result = await send(refreshed.access_token);
  }

  const res = NextResponse.json(result.body, { status: result.status });
  if (refreshed?.access_token) setSession(res, refreshed);
  if (result.status === 401 && refresh) clearSession(res); // refresh token rejected: the session is over
  return res;
}

/** Refresh tokens rotate: Django returns a new pair and the old refresh token stops working. */
async function refreshTokens(refresh: string, req: NextRequest) {
  const { status, body } = await django<{ access_token?: string; refresh_token?: string }>("auth/token/refresh", { method: "POST", body: JSON.stringify({ refresh_token: refresh }), req });
  return status < 400 ? body.data : undefined;
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
