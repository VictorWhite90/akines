import type { Metadata } from "next";
import Constellation from "@/components/constellation/Constellation";

export const metadata: Metadata = { title: "Constellation · Akines" };

export default function ConstellationPage() {
  return <Constellation />;
}
