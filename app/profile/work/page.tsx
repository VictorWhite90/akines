import type { Metadata } from "next";
import { Suspense } from "react";
import Setup from "@/components/workprofile/Setup";

export const metadata: Metadata = { title: "Your work profile · Akines" };

export default function WorkProfilePage() {
  return <Suspense><Setup /></Suspense>;
}
