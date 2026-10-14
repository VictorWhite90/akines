import type { Metadata } from "next";
import Welcome from "@/components/onboarding/Welcome";

export const metadata: Metadata = { title: "Welcome to Akines" };

/** ?signout=1 clears the prototype session first (used by Sign out). */
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ signout?: string }> }) {
  const { signout } = await searchParams;
  return <Welcome signedOut={signout === "1"} />;
}
