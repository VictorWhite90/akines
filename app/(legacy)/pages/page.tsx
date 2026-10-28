import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO } from "@/lib/demo/mode";
import PageDirectory from "./PageDirectory";
import "./pages.css";

export const metadata: Metadata = { title: "All pages · Akines preview" };

/** Preview builds only: every page in the portal, by feature, each one link away. */
export default function PagesPage() {
  if (!DEMO) notFound();
  return <PageDirectory />;
}
