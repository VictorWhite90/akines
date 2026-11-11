import { NextResponse, type NextRequest } from "next/server";
import { clearSession, COOKIE, django, MAX_JSON_BYTES, readBodyCapped, sameOrigin, setSession, type Envelope, type Tokens } from "@/lib/api/server";

/**
 * Auth endpoints for the web app. Each forwards to the Django auth API and, when Django returns tokens,
 * moves them into HttpOnly cookies and strips them from the response the browser receives.
 *
 *   POST /api/auth/login            {identifier, password}  → signed in, or {redirect_to_2fa: true, mfa_token}
 *                                   (identifier: mobile number, username or email)
 *   POST /api/auth/signup-start     {contact}               → code sent to that email or mobile number
 *   POST /api/auth/signup-verify    {contact, otp}          → {signup_token}
 *   POST /api/auth/signup-complete  {signup_token, username, password, age_confirmed, intent?} → signed in
 *   POST /api/auth/verify-email   {identifier, otp}       → signed in (accounts from the older sign-up)
 *   POST /api/auth/resend-email   {identifier}
 *   POST /api/auth/verify-2fa     {mfa_token, otp}        → signed in (mfa_token comes from login)
 *   POST /api/auth/resend-2fa     {mfa_token}
 *   POST /api/auth/forgot         {identifier}            → reset code sent
 *   POST /api/auth/verify-reset   {identifier, otp}       → {reset_token}
 *   POST /api/auth/reset          {reset_token, password}
 *   POST /api/auth/logout
 */
const ROUTES: Record<string, string> = {
  login: "auth/login",
  "signup-start": "auth/signup/start",
  "signup-verify": "auth/signup/verify",
  "signup-complete": "auth/signup/complete",
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

  // Sign-in bodies are a few fields: anything past the JSON cap is refused before it reaches Django.
  const read = await readBodyCapped(req, MAX_JSON_BYTES);
  if (!read.ok) return NextResponse.json({ success: false, message: read.status === 413 ? "That request is too large." : "That request couldn't be read." }, { status: read.status });
  const payload = new TextDecoder().decode(read.body);
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
