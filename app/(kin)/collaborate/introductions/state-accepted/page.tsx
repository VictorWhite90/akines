import type { Metadata } from "next";
import Introductions from "@/components/collaborate/collaborators/Introductions";

export const metadata: Metadata = { title: "Introduction requests · Akines" };

/** Review address: the design's accepted frame of the list. */
export default function IntroductionsStatePage() {
  return <Introductions variant="accepted" />;
}
