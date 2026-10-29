import Image from 'next/image';
import { hero } from '@/lib/landing/content';
import { Button } from './Button';
import { Lines } from './Lines';

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="hero__img"
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content">
        <p className="hero__eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title" className="hero__headline">
          <Lines text={hero.headline} words />
        </h1>
        <div className="hero__actions">
          <Button href={hero.primary.href} variant="light-filled">
            {hero.primary.label}
          </Button>
          <Button href={hero.secondary.href} variant="light-outline" icon="arrow-down">
            {hero.secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
