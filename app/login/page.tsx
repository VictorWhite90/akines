import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";

export const metadata: Metadata = { title: "Sign in · Kinnect" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
  return <AuthFlow mode="login" startAt={step} />;
}
