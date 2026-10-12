import type { Metadata } from "next";
import CliqsHome from "@/components/cliqs/CliqsHome";

export const metadata: Metadata = { title: "Cliqs · Akines" };

export default function CliqsPage() {
  return <CliqsHome />;
}
