import type { Metadata } from "next";
import "./about.css";

export const metadata: Metadata = {
  title: "About Akines: less scrolling, more belonging",
  description: "Akines helps you meet people who share more than interests: collaborators, confidants and a genuine part of your life.",
};

/** Manrope comes from the root layout (self-hosted, see app/fonts.css). */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <div className="ak">{children}</div>;
}
