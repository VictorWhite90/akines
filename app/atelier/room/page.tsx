import type { Metadata } from "next";
import PresenceRoom from "@/components/atelier/PresenceRoom";

export const metadata: Metadata = { title: "Presence Room · Akines" };

export default function RoomPage() {
  return <PresenceRoom />;
}
