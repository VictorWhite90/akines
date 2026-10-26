import type { Metadata } from "next";
import { Suspense } from "react";
import Workspace from "@/components/collab/Workspace";

export const metadata: Metadata = { title: "Project workspace · Akines" };

/** The sample project is prebuilt; projects made in the browser render on first visit. ?tab= is read in the browser. */
export function generateStaticParams() {
  return [{ id: "market-light" }];
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><Workspace key={id} id={id} /></Suspense>;
}
