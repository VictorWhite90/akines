import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Settings from "@/components/settings/Settings";
import { isSectionId } from "@/components/settings/sections";

export const metadata: Metadata = { title: "Settings · Akines" };

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "profile") redirect("/profile"); // the public profile moved to its own page
  if (!isSectionId(section)) notFound();
  return <Settings section={section} />;
}
