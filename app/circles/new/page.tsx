import type { Metadata } from "next";
import CreateKinCircle from "@/components/circles/CreateKinCircle";

export const metadata: Metadata = { title: "Create your KinCircle · Akines" };

export default function NewKinCirclePage() {
  return <CreateKinCircle />;
}
