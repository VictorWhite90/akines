import { NextResponse, type NextRequest } from "next/server";

/**
 * Who sees what, decided on the server before any page renders:
 * - Visitors without an account only reach public pages, unless they start a guest preview.
 * - Signed-in members skip About, log-in and sign-up and go straight to Home.
 */
const PUBLIC = ["/about", "/about/philosophy", "/login", "/signup"];
const PUBLIC_PREFIX = ["/circles/join/"];
// Pages a signed-in member has no reason to see. /login stays reachable for its post-sign-in steps (?step=…).
const MEMBERS_SKIP = ["/about", "/signup"];

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    // A plain URL: NextURL would put the trailing slash back and loop.
    const url = new URL(req.url);
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }
  const signedIn = Boolean(req.cookies.get("ak_refresh")?.value);
  const guest = req.cookies.get("ak_guest")?.value === "1";
  const isPublic = PUBLIC.includes(pathname) || PUBLIC_PREFIX.some((p) => pathname.startsWith(p));

  // The steps after log-in (?step=…) need a session.
  if (!signedIn && !guest && pathname === "/login" && searchParams.get("step")) {
    const url = req.nextUrl.clone();
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (!signedIn && !guest && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/about";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (signedIn && (MEMBERS_SKIP.includes(pathname) || (pathname === "/login" && !searchParams.get("step") && !searchParams.get("signout") && !searchParams.get("ended")))) {
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
