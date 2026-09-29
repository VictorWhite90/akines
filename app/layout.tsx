import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
import "./globals.css";
import "./artelia.css";
import "./auth.css";
import "./rooms.css";
import "./studio.css";
import "./store.css";
import "./circles.css";
import "./activities.css";
import "./feed.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["500", "600"], style: ["normal", "italic"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Artelia Connect: the home of African creativity",
  description: "A living, trusted community where artists, collectors, curators and the African diaspora form lasting relationships through art.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
