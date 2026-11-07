import type { Metadata } from "next";
import Request from "@/components/collaborate/collaborators/Request";

export const metadata: Metadata = { title: "Introduction request · Akines" };

/** An introduction request to the first recommendation (the design's address). */
export default function RequestPage() {
  return <Request />;
}
