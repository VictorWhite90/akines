import type { Metadata } from "next";
import KinCirclesPage from "@/components/circles/KinCirclesPage";

export const metadata: Metadata = { title: "KinCircle · Akines" };

export default function Circles() {
  return <KinCirclesPage />;
}
