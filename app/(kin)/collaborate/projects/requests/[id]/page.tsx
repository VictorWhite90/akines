import type { Metadata } from "next";
import RequestPage from "@/components/collaborate/applications/Requests";

export const metadata: Metadata = { title: "Your request · Akines" };

/** Your request to join a project (an application to its open call), at the stage it is at. */
export default async function YourRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestPage id={decodeURIComponent(id)} />;
}
