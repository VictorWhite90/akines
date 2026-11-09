import type { Metadata } from "next";
import { OpenCallsScreen } from "@/components/collaborate/applicants/OpenCalls";

export const metadata: Metadata = { title: "Open calls · Akines" };

/** The design's empty state, at its own address. */
export default function Page() {
  return <OpenCallsScreen variant="empty" />;
}
