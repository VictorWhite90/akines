import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Fraunces, Instrument_Sans, Playfair_Display } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
import Splash from "@/components/onboarding/Splash";
import "./welcome.css";
import "./globals.css";
import "./artelia.css";
import "./auth.css";
import "./rooms.css";
import "./studio.css";
import "./store.css";
import "./circles.css";
import "./activities.css";
import "./feed.css";
import "./messages.css";
import "./night.css";
import "./atelier.css";
import "./ankara.css";
import "./dark.css";
import "./dark-legacy.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["500", "600"], style: ["normal", "italic"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", weight: ["400", "500", "600", "700"], display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-dmmono", weight: ["400", "500"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Akines: less scrolling, more belonging",
  description: "Akines helps people from every line of work find each other on purpose: fewer people, honest conversation, small circles and things made together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${dmSans.variable} ${fraunces.variable} ${instrument.variable} ${dmMono.variable}`}>
      <head>
        {/* Apply the saved theme before first paint, so dark mode never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var q=new URLSearchParams(location.search).get("theme");if(q==="dark"||q==="light"||q==="system")localStorage.setItem("ak:theme",q);var m=localStorage.getItem("ak:theme")||"light";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}` }} />
      </head>
      <body>
        <Splash />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
