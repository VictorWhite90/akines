import type { Metadata } from "next";
import PostCall from "@/components/collab/PostCall";

export const metadata: Metadata = { title: "Post an open call · Akines" };

export default function NewCallPage() {
  return <PostCall />;
}
