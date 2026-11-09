import type { Metadata } from "next";
import { OpenCallsScreen } from "@/components/collaborate/applicants/OpenCalls";

export const metadata: Metadata = { title: "Open calls · Akines" };

/** The calls you host that have no project yet (12.46 OPEN CALL REVIEW). */
export default function Page() {
  return <OpenCallsScreen />;
}
