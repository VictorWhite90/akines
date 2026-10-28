import type { Metadata } from "next";
import CustomRoom from "@/components/rooms/CustomRoom";
import RoomSpace from "@/components/rooms/RoomSpace";
import { ROOMS } from "@/lib/data/community";

export function generateStaticParams() {
  return ROOMS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const room = ROOMS.find((r) => r.id === id);
  return { title: room ? `${room.title} · Presence Room` : "Presence Room" };
}

export default async function RoomPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { id } = await params;
  const { demo } = await searchParams;
  const room = ROOMS.find((r) => r.id === id);
  if (!room) return <CustomRoom id={id} demo={demo} />;
  return <RoomSpace room={room} demo={demo} />;
}
