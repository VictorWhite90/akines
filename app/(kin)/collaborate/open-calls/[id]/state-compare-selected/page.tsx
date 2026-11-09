import type { Metadata } from "next";
import { CallScreen } from "@/components/collaborate/applicants/OpenCalls";

export const metadata: Metadata = { title: "Applicants · Akines" };

/** The design's "compare-selected" frame of an open call, at its own address. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallScreen callId={id} variant="compare-selected" />;
}
