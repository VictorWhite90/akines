import type { Metadata } from "next";
import Stage from "@/components/layouts/Stage";
import Switcher from "@/components/layouts/Switcher";

export const metadata: Metadata = { title: "Layout: Stage + people dock · Akines" };

export default function Page() {
  return (
    <div className="lx">
      <Switcher />
      <Stage />
    </div>
  );
}
