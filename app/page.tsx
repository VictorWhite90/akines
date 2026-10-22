
import type { Metadata } from "next";
import AnkaraHome from "@/components/home/AnkaraHome";

export const metadata: Metadata = { title: "Home · Akines" };

/** Home: all of Akines (Banter, live rooms, games, stories) in the Figma community-home styling. */
export default function Home() {
  return <AnkaraHome />;
}
