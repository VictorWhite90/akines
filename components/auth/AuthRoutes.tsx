"use client";

import { useSearchParams } from "next/navigation";
import AuthFlow from "./AuthFlow";
import LoginScreen from "./LoginScreen";

/**
 * The log-in and sign-up pages read their options (?step=, ?signout=, ?ended=) here in the browser, so the
 * pages themselves are static: served from the CDN next to the visitor and prefetched by links, instead of
 * being rendered on a server for every visit.
 */
export function LoginRoute() {
  const q = useSearchParams();
  const step = q.get("step");
  if (!step || step === "account") return <LoginScreen signedOut={q.get("signout") === "1"} sessionEnded={q.get("ended") === "1"} />;
  return <AuthFlow mode="login" startAt={step} />;
}

export function SignupRoute() {
  return <AuthFlow mode="signup" startAt={useSearchParams().get("step") ?? undefined} />;
}
