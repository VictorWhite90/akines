import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("View profile") };

export default function Page() {
  return <ComingSoon title="View profile" />;
}
