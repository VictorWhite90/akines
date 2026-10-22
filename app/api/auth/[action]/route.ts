import { NextResponse, type NextRequest } from "next/server";
import { clearSession, COOKIE, django, sameOrigin, setSession, type Envelope, type Tokens } from "@/lib/api/server";

/**
 * Auth endpoints for the web app. Each forwards to the Django auth API and, when Django returns tokens,
 * moves them into HttpOnly cookies and strips them from the response the browser receives.
 *
 *   POST /api/auth/login          {email, password}       → signed in, or {twoFactor: true}
 *   POST /api/auth/register       {email, password}       → code sent to the email
 *   POST /api/auth/verify-email   {email, otp}            → signed in
 *   POST /api/auth/resend-email   {email}
 *   POST /api/auth/verify-2fa     {email, otp}            → signed in
 *   POST /api/auth/resend-2fa     {email}
 *   POST /api/auth/forgot         {email}                 → reset code sent
 *   POST /api/auth/verify-reset   {email, otp}
 *   POST /api/auth/reset          {email, password}
 *   POST /api/auth/logout
 */
const ROUTES: Record<string, string> = {
  login: "auth/login",
  register: "auth/register",
  "verify-email": "auth/verify-otp/email",
  "resend-email": "auth/resend-otp/email",
  "verify-2fa": "auth/verify-otp/2fa",
  "resend-2fa": "auth/resend-otp/2fa",
  forgot: "auth/password/forgot",
  "verify-reset": "auth/password/verify-otp",
  reset: "auth/password/reset",
};

type SignedIn = Tokens & { token_type?: string; expiry?: unknown; redirect_to_2fa?: boolean; user?: Record<string, unknown> };

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!sameOrigin(req)) return NextResponse.json({ success: false, message: "Request blocked." }, { status: 403 });

  if (action === "logout") {
    const res = NextResponse.json({ success: true, message: "Signed out." });
    const refresh = req.cookies.get(COOKIE.refresh)?.value;
    if (refresh) await django("auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: refresh }), token: req.cookies.get(COOKIE.access)?.value, req });
    clearSession(res);
    return res;
  }

  const target = ROUTES[action];
  if (!target) return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });

  const payload = await req.text();
  const { status, body } = await django<SignedIn>(target, { method: "POST", body: payload || "{}", req });

  const data = body.data;
  if (status < 400 && data?.access_token) {
    const { access_token, refresh_token, token_type, expiry, ...rest } = data;
    void token_type;
    void expiry;
    const res = NextResponse.json({ ...body, data: rest } satisfies Envelope, { status });
    setSession(res, { access_token, refresh_token });
    return res;
  }
  return NextResponse.json(body, { status });
}
