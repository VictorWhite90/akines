import type { Metadata } from "next";
import KinHome from "@/components/home/KinHome";

export const metadata: Metadata = { title: "Home · Akines" };

/** Home: built to the Figma community-home frame, with Akines content. */
export default function Home() {
  return <KinHome />;
}
