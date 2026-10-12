import type { Metadata } from "next";
import CreateGame from "@/components/play/CreateGame";

export const metadata: Metadata = { title: "Create a Game · Akines" };

export default function NewGamePage() {
  return <CreateGame />;
}
