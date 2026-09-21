import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display-src" });
const body = Montserrat({ subsets: ["latin"], variable: "--font-body-src" });

export const metadata: Metadata = {
  title: { default: "Artelia Connect", template: "%s · Artelia Connect" },
  description: "The human connection and collaboration infrastructure for African creativity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
