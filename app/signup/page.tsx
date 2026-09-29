import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";

export const metadata: Metadata = { title: "Join · Artelia Connect" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
  return <AuthFlow mode="signup" startAt={step} />;
}
