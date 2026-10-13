import type { Metadata } from "next";
import Panes from "@/components/layouts/Panes";
import Switcher from "@/components/layouts/Switcher";

export const metadata: Metadata = { title: "Layout: Stacked panes · Akines" };

export default function Page() {
  return (
    <div className="lx">
      <Switcher />
      <Panes />
    </div>
  );
}
