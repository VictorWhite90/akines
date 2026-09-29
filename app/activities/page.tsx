import type { Metadata } from "next";
import ActivitiesGrid from "@/components/activities/ActivitiesGrid";

export const metadata: Metadata = { title: "Activities · Kinnect" };

export default function ActivitiesPage() {
  return <ActivitiesGrid />;
}
