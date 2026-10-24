import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginRoute } from "@/components/auth/AuthRoutes";
import LoginScreen from "@/components/auth/LoginScreen";

export const metadata: Metadata = { title: "Log in · Akines" };

/** Static page: the form is in the first HTML; ?step=, ?signout= and ?ended= are read in the browser. */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginScreen />}>
      <LoginRoute />
    </Suspense>
  );
}
