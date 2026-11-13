import { NextResponse, type NextRequest } from "next/server";
import { DEMO } from "@/lib/demo/mode";

/**
 * Who sees what, decided on the server before any page renders:
 * - Visitors without an account only reach the public pages (the landing page, sign-in and join); everything else sends them to the landing page.
 * - Signed-in members skip the landing page, log-in and sign-up and go straight to Home.
 * - Preview (demo) builds follow the same flow: the landing page first, then sign in (any details, or
 *   "Preview as guest") to reach the app. The All pages directory (/pages) stays open so it can be shared.
 */
const PUBLIC = ["/landing", "/login", "/signup", "/pages"];
// Pages a signed-in member has no reason to see. /login stays reachable for its post-sign-in steps (?step=…).
const MEMBERS_SKIP = ["/landing", "/signup"];

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    // A plain URL: NextURL would put the trailing slash back and loop.
    const url = new URL(req.url);
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }
  // Demo builds have no backend: the in-browser demo marks the session with the readable ak_in flag instead.
  const signedIn = DEMO ? req.cookies.get("ak_in")?.value === "1" : Boolean(req.cookies.get("ak_refresh")?.value);
  const isPublic = PUBLIC.includes(pathname);

  // The steps after log-in (?step=…) need a session.
  if (!signedIn && pathname === "/login" && searchParams.get("step")) {
    const url = req.nextUrl.clone();
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (!signedIn && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/landing";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (!DEMO && signedIn && (MEMBERS_SKIP.includes(pathname) || (pathname === "/login" && !searchParams.get("step") && !searchParams.get("signout") && !searchParams.get("ended")))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except API routes, Next internals and static files.
  matcher: ["/((?!api/|_next/|favicon|akines/|.*\\.(?:png|jpg|jpeg|svg|webp|avif|gif|ico|mp4|webm|woff2?|txt|xml)$).*)"],
};
