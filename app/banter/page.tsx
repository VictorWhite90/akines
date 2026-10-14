import type { Metadata } from "next";
import BanterDeck from "@/components/banter/BanterDeck";

export const metadata: Metadata = { title: "Banter · Akines" };

export default function BanterPage() {
  return <BanterDeck />;
}
