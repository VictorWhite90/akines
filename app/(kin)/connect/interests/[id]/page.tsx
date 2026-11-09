import type { Metadata } from "next";
import { InterestPage } from "@/components/connect/Lists";
import { interestById } from "@/lib/connect/interests";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${interestById(decodeURIComponent(id))?.title ?? "Interest"} · Akines` };
}

/** Connect, Discover, one interest. */
export default async function ConnectInterestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InterestPage id={decodeURIComponent(id)} />;
}
