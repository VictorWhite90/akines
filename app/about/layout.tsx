import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./about.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "About Akines: less scrolling, more belonging",
  description: "Akines helps you meet people who share more than interests: collaborators, confidants and a genuine part of your life.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <div className={`ak ${manrope.variable}`}>{children}</div>;
}
