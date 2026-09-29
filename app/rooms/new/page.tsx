import type { Metadata } from "next";
import CreateRoom from "@/components/rooms/CreateRoom";

export const metadata: Metadata = { title: "Create a room · Artelia Connect" };

export default async function NewRoomPage({ searchParams }: { searchParams: Promise<{ circle?: string }> }) {
  const { circle } = await searchParams;
  return <CreateRoom circle={circle} />;
}
