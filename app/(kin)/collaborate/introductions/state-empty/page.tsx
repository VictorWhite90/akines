import type { Metadata } from "next";
import Introductions from "@/components/collaborate/collaborators/Introductions";

export const metadata: Metadata = { title: "Introduction requests · Akines" };

/** Review address: the design's empty frame of the list. */
export default function IntroductionsStatePage() {
  return <Introductions variant="empty" />;
}
