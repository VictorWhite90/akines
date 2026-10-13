import type { Metadata } from "next";
import TodayBento from "@/components/layouts/TodayBento";
import Switcher from "@/components/layouts/Switcher";

export const metadata: Metadata = { title: "Layout: Today + bento · Akines" };

export default function Page() {
  return (
    <div className="lx">
      <Switcher />
      <TodayBento />
    </div>
  );
}
