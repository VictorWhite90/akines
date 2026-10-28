import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "./tokens.css";
import "@/components/kin/base.css";
import Splash from "@/components/onboarding/Splash";
import Shell from "@/components/kin/Shell";
import { BOOT_SCRIPT } from "@/lib/boot";

/**
 * Root layout for the redesigned pages (the "kin" system). Loads two fonts and two stylesheets, nothing
 * from app/(legacy). Shares the boot script, the splash, the session gate and the member context with the
 * legacy layout, so theme and sign-in carry over; only the presentation is new.
 */
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content" };

export const metadata: Metadata = {
  title: "Akines: less scrolling, more belonging",
  description: "Akines helps people from every line of work find each other on purpose: fewer people, honest conversation, small circles and things made together.",
};

export default function KinLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Splash />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
