import type { Metadata } from "next";
import BanterHome from "@/components/banter/BanterHome";

export const metadata: Metadata = { title: "Banter (classic) · Akines" };

/** The previous Banter design, kept for comparison. */
export default function BanterClassicPage() {
  return <BanterHome />;
}
