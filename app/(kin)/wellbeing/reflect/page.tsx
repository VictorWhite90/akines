import type { Metadata } from "next";
import { ReflectPrivately } from "@/components/care/CarePages";

export const metadata: Metadata = { title: "Reflect privately | Akines" };

export default function Page() {
  return <ReflectPrivately />;
}
