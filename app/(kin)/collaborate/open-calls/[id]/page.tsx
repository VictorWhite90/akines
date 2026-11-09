import type { Metadata } from "next";
import { CallScreen } from "@/components/collaborate/applicants/OpenCalls";

export const metadata: Metadata = { title: "Applicants · Akines" };

/** One of your open calls and the people who applied. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallScreen callId={id} />;
}
