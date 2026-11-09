import type { Metadata } from "next";
import { ApplicantsScreen } from "@/components/collaborate/applicants/Applicants";

export const metadata: Metadata = { title: "Applicants · Akines" };

/** The people who applied to join a project (12.45 REVIEW APPLICANTS). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicantsScreen projectId={id} />;
}
