import type { Metadata } from "next";
import AnkaraHome from "@/components/home/AnkaraHome";

export const metadata: Metadata = { title: "Home · Akines" };

/** Home: the hero carousel, then every core feature with its own colour and live feed. */
export default function Home() {
  return <AnkaraHome />;
}
