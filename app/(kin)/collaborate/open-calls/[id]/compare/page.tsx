import type { Metadata } from "next";
import { CallCompareScreen } from "@/components/collaborate/applicants/OpenCalls";

export const metadata: Metadata = { title: "Applicants · Akines" };

/** Up to three of a call's applicants side by side. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallCompareScreen callId={id} />;
}
