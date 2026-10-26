import type { Metadata } from "next";
import MyApplications from "@/components/collab/MyApplications";

export const metadata: Metadata = { title: "My applications · Akines" };

export default function ApplicationsPage() {
  return <MyApplications />;
}
