import type { Metadata } from "next";
import RequestSent from "@/components/collaborate/collaborators/RequestSent";

export const metadata: Metadata = { title: "Request sent · Akines" };

export default function RequestSentPage() {
  return <RequestSent />;
}
