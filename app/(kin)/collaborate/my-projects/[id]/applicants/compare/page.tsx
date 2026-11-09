import type { Metadata } from "next";
import { CompareScreen } from "@/components/collaborate/applicants/Applicants";

export const metadata: Metadata = { title: "Applicants · Akines" };

/** Up to three applicants side by side. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompareScreen projectId={id} />;
}
