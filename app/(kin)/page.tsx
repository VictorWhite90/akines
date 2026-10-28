import type { Metadata } from "next";
import Home from "@/components/kin/home/Home";

export const metadata: Metadata = { title: "Home · Akines" };

/** Home: what is live now, then your circles' feed, first. */
export default function HomePage() {
  return <Home />;
}
