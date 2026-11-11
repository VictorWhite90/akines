import type { Metadata } from "next";
import ComingSoon, { soonTitle } from "@/components/kin/ComingSoon";

export const metadata: Metadata = { title: soonTitle("Complete your profile") };

export default function Page() {
  return <ComingSoon title="Complete your profile" />;
}
