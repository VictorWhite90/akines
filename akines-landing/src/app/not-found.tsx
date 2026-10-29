import type { Metadata } from 'next';
import { getImageProps } from 'next/image';
import { Button } from '@/components/Button';
import { Lines } from '@/components/Lines';
import { Logo } from '@/components/Logo';
import { NotFoundMotion } from '@/components/NotFoundMotion';
import { notFoundPage as page } from '@/content/content';

export const metadata: Metadata = {
  title: 'Page not found | Akines',
  description: 'This page has not been made yet. Return to Akines to find people you can genuinely know, trust and create with.',
};

/**
 * The page every call to action leads to until its real destination exists (see src/lib/links.ts).
 * Full-screen photograph (portrait crop on mobile), the copy centred low in the frame, one way home.
 * The entrance is pure CSS (src/styles/notfound.css); NotFoundMotion only adds a gentle pointer parallax.
 */
export default function NotFound() {
  const common = { alt: page.imageAlt, fill: true, priority: true, sizes: '100vw' } as const;
  const wide = getImageProps({ ...common, src: page.image }).props;
  const portrait = getImageProps({ ...common, src: page.imagePortrait }).props;
  const { srcSet: wideSet } = wide;
  const { srcSet: portraitSet, ...img } = portrait;

  return (
    <div className="nf">
      <div className="nf__parallax">
        <picture className="nf__media">
          <source media="(min-width: 768px)" srcSet={wideSet} />
          <img {...img} srcSet={portraitSet} className="cover nf__img" />
        </picture>
      </div>
      <div className="nf__scrim" aria-hidden="true" />

      <header className="nf__header">
        <a className="nf__logo" href="/" aria-label="Akines, back to the home page">
          <Logo />
        </a>
      </header>

      <main className="nf__content">
        <p className="nf__eyebrow">
          <span className="nf__rule nf__rule--l" aria-hidden="true" />
          <span>{page.eyebrow}</span>
          <span className="nf__rule nf__rule--r" aria-hidden="true" />
        </p>
        <h1 className="nf__headline">
          <Lines text={page.headline} words />
        </h1>
        <p className="nf__body">{page.body}</p>
        <div className="nf__actions">
          <Button href={page.action.href} variant="light-filled" icon="none" size="large">
            {page.action.label}
          </Button>
        </div>
      </main>
      <NotFoundMotion />
    </div>
  );
}
