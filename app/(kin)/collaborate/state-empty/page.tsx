import type { Metadata } from "next";
import { HomeEmpty } from "@/components/collaborate/home/Home";

export const metadata: Metadata = { title: "Collaborate · Akines" };

/** The design's empty Home (someone with no projects yet), at its own address. */
export default function CollaborateEmptyPage() {
  return <HomeEmpty staticState />;
}
