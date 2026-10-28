import type { Metadata } from "next";
import { Suspense } from "react";
import BanterHub from "@/components/banter/BanterHub";

export const metadata: Metadata = { title: "Banter · Akines" };

export default function BanterPage() {
  return <Suspense><BanterHub /></Suspense>;
}
