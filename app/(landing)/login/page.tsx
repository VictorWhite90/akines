import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginRoute } from "@/components/auth/AuthRoutes";
import LoginScreen from "@/components/auth/LoginScreen";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = { title: "Sign in | Akines" };

/**
 * Sign in opens as a panel over the landing page, as the product design draws it.
 * Static page: ?step=, ?signout= and ?ended= are read in the browser.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<><LandingPage /><LoginScreen /></>}>
      <LoginRoute />
    </Suspense>
  );
}
