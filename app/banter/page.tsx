import type { Metadata } from "next";
import BanterHome from "@/components/banter/BanterHome";

export const metadata: Metadata = { title: "Banter · Akines" };

export default function BanterPage() {
  return <BanterHome />;
}
