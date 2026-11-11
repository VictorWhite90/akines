import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("My Store") };

export default function Page() {
  return <ComingSoon eyebrow="Make & Sell" title="My Store" />;
}
