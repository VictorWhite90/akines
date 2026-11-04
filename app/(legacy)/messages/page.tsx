import type { Metadata } from "next";
import Messages from "@/components/messages/Messages";

export const metadata: Metadata = { title: "Messages | Akines" };

export default function MessagesPage() {
  return <Messages />;
}
