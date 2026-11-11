import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Help") };

export default function Page() {
  return <ComingSoon title="Help" />;
}
