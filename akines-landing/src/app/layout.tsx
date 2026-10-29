import type { Metadata, Viewport } from 'next';
import '@fontsource/alice/400.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/header.css';
import '../styles/hero.css';
import '../styles/intention.css';
import '../styles/rhythm.css';
import '../styles/experiences.css';
import '../styles/trust.css';
import '../styles/closing.css';
import '../styles/menu.css';
import '../styles/motion.css';
import '../styles/notfound.css';

export const metadata: Metadata = {
  title: 'Akines | Less scrolling. More belonging.',
  description:
    'Akines helps you find people you can genuinely know, trust and create with. Begin with what matters to you.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F4F1EB',
};

const HEAD_SCRIPT = `(function(){var d=document,h=d.documentElement;h.classList.add('js');var r=function(){h.classList.add('hero-ready')};d.addEventListener('load',function(e){var t=e.target;if(t&&t.classList&&(t.classList.contains('hero__img')||t.classList.contains('nf__img')))r()},true);d.addEventListener('error',function(e){var t=e.target;if(t&&t.classList&&(t.classList.contains('hero__img')||t.classList.contains('nf__img')))r()},true);setTimeout(r,4000)})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The `js` class lets motion.css hide things that script will reveal; it is set before first paint.
    // `hero-ready` is added when the hero photograph (or the 404 photograph) has loaded (or after 4 s), so its entrance plays with the photo on screen.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
