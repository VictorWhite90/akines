import type { Metadata } from "next";
import Settings from "@/components/settings/Settings";

export const metadata: Metadata = { title: "Settings · Akines" };

export default function SettingsPage() {
  return <Settings />;
}
