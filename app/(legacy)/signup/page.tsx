import type { Metadata } from "next";
import { Suspense } from "react";
import AuthFlow from "@/components/auth/AuthFlow";
import { SignupRoute } from "@/components/auth/AuthRoutes";

export const metadata: Metadata = { title: "Join · Akines" };

/** Static page: the form is in the first HTML; ?step= is read in the browser. */
export default function SignupPage() {
  return (
    <Suspense fallback={<AuthFlow mode="signup" />}>
      <SignupRoute />
    </Suspense>
  );
}
