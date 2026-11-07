import type { Metadata } from "next";
import { IntroductionRequests } from "@/components/collaborate/collaborators/Lists";

export const metadata: Metadata = { title: "Introduction requests · Akines" };

export default function IntroductionRequestsPage() {
  return <IntroductionRequests />;
}
