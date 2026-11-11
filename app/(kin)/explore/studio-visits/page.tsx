import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Studio Visits") };

export default function Page() {
  return <ComingSoon eyebrow="Explore" title="Studio Visits" />;
}
