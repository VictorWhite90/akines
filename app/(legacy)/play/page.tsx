import type { Metadata } from "next";
import PlayHome from "@/components/play/PlayHome";

export const metadata: Metadata = { title: "Play Together · Akines" };

export default function PlayPage() {
  return <PlayHome />;
}
