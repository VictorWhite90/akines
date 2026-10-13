import type { Metadata } from "next";
import PresenceRoom from "@/components/atelier/PresenceRoom";

export const metadata: Metadata = { title: "Presence Room · Akines atelier" };

export default function RoomPage() {
  return <PresenceRoom />;
}
