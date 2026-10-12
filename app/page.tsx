import type { Metadata } from "next";
import Constellation from "@/components/constellation/Constellation";

export const metadata: Metadata = { title: "Your sky · Akines" };

/** Home is your constellation of relationships, not a feed. The previous home lives at /community. */
export default function Home() {
  return <Constellation />;
}
