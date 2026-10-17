import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import LoginScreen from "@/components/auth/LoginScreen";

export const metadata: Metadata = { title: "Log in · Akines" };

/** The log-in form is its own screen; the steps after it (?step=intent) use the shared flow. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
  if (!step || step === "account") return <LoginScreen />;
  return <AuthFlow mode="login" startAt={step} />;
}
