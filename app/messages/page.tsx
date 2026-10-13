import type { Metadata } from "next";
import KinMessage from "@/components/messages/KinMessage";

export const metadata: Metadata = { title: "KinMessage · Akines" };

export default function MessagesPage() {
  return <KinMessage />;
}
