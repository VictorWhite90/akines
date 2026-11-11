import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Creative Wellbeing") };

export default function Page() {
  return <ComingSoon eyebrow="Care" title="Creative Wellbeing" />;
}
