import type { Metadata } from "next";
import Introductions from "@/components/collaborate/collaborators/Introductions";

export const metadata: Metadata = { title: "Introduction requests · Akines" };

/** People who asked to be introduced to you (behind the Collaborate Home tile). */
export default function IntroductionsPage() {
  return <Introductions />;
}
