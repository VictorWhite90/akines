import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Shop Art") };

export default function Page() {
  return <ComingSoon eyebrow="Explore" title="Shop Art" />;
}
