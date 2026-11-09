import type { Metadata } from "next";
import { ForYouAll } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "For you on Akines · Akines" };

/** Connect, Discover, For you, all. */
export default function ForYouPage() {
  return <ForYouAll />;
}
