import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThreadView from "@/components/messages/ThreadView";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";

export function generateStaticParams() {
  return (Object.keys(PEOPLE) as PersonId[]).filter((id) => id !== ME.id).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PEOPLE[id as PersonId];
  return { title: p ? `${p.name} · Messages` : "Messages" };
}

/** DM contract other pages link to: /messages/[personId]. */
export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === ME.id || !(id in PEOPLE)) notFound();
  return <ThreadView id={id as PersonId} />;
}
