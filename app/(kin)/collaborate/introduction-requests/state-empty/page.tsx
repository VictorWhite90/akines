import type { Metadata } from "next";
import { IntroductionRequests } from "@/components/collaborate/collaborators/Lists";

export const metadata: Metadata = { title: "Introduction requests · Akines" };

/** The design's empty state, at its own address. */
export default function IntroductionRequestsEmptyPage() {
  return <IntroductionRequests staticEmpty />;
}
