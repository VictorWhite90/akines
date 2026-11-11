import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Banter") };

export default function Page() {
  return <ComingSoon eyebrow="Connect" title="Banter" />;
}
