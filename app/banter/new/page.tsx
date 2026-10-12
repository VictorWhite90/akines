import type { Metadata } from "next";
import StartBanter from "@/components/banter/StartBanter";

export const metadata: Metadata = { title: "Start a Banter · Akines" };

export default function NewBanterPage() {
  return <StartBanter />;
}
