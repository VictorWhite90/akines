import type { Metadata, Viewport } from "next";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import AppShell from "@/components/shell/AppShell";
import Splash from "@/components/onboarding/Splash";
import NavProgress from "@/components/shell/NavProgress";
import { BOOT_SCRIPT } from "@/lib/boot";
import "./fonts.css";
import "./tokens.css";
import "./welcome.css";
import "./globals.css";
import "./artelia.css";
import "./auth.css";
import "./login.css";
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
import "./kinhome.css";
import "./design-system.css";
import "./cm.css";
import "./settings.css";
import "./profile.css";
import "./notifications.css";
import "./collab.css";
import "./portfolio.css";
import "./mobile.css";

/** The keyboard shrinks the page (Android), and the app can use the full screen around the notch (iOS). */
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content" };

export const metadata: Metadata = {
  title: "Akines: less scrolling, more belonging",
  description: "Akines helps people from every line of work find each other on purpose: fewer people, honest conversation, small circles and things made together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Open the image connections before the first photo is requested. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://a.storyblok.com" crossOrigin="" />
        {/* Before first paint: the saved theme (so dark mode never flashes light), and the splash on a device that hasn't seen it. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Splash />
        <NavProgress />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
