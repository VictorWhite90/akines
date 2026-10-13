import type { Metadata } from "next";
import Introduction from "@/components/atelier/Introduction";

export const metadata: Metadata = { title: "A meaningful introduction · Akines atelier" };

export default function IntroductionPage() {
  return <Introduction />;
}
