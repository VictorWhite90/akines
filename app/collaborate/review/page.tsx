import type { Metadata } from "next";
import { ReviewIndex } from "@/components/collab/ReviewDesk";

export const metadata: Metadata = { title: "Calls you host · Akines" };

export default function ReviewPage() {
  return <ReviewIndex />;
}
