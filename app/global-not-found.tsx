import type { Metadata } from "next";
import "@/components/kin/akines/fonts.css";
import "@/components/kin/akines/tokens.css";
import "@/components/kin/akines/base.css";
import "@/components/kin/akines/library.css";
import "@/components/kin/akines/notfound.css";
import NotFound from "@/components/kin/NotFound";
import Companion from "@/components/shell/Companion";

/**
 * Any URL no route matches. The app has three root layouts (legacy, kin, landing), so the 404 brings its own
 * document. `js` and `hero-ready` let the photo fade in once it has loaded, as on the landing page.
 * Create AI sits in the corner here too, as on every page of the design.
 */
export const metadata: Metadata = { title: "Page not found | Akines" };

const HEAD_SCRIPT = `(function(){var h=document.documentElement;h.classList.add('js');var r=function(){h.classList.add('hero-ready')};document.addEventListener('load',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('nf__img'))r()},true);setTimeout(r,3000)})()`;

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} /></head>
      <body><NotFound /><Companion /></body>
    </html>
  );
}
