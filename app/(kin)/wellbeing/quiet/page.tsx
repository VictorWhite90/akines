import type { Metadata } from "next";
import { QuietCompany } from "@/components/care/CarePages";

export const metadata: Metadata = { title: "Quiet company | Akines" };

export default function Page() {
  return <QuietCompany />;
}
