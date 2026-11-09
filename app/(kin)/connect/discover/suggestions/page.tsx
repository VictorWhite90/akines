import type { Metadata } from "next";
import { Suggestions } from "@/components/connect/Lists";

export const metadata: Metadata = { title: "People for you · Akines" };

/** Connect, Discover, All suggestions. */
export default function SuggestionsPage() {
  return <Suggestions />;
}
