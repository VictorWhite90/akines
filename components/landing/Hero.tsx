import Img from '@/components/kin/Img';
import { hero } from '@/lib/landing/content';
import Button from '@/components/kin/Button';
import { Lines } from './Lines';

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <Img
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
          <Button href={hero.primary.href} light fluid arrow="up-right">
            {hero.primary.label}
          </Button>
          <Button href={hero.secondary.href} variant="secondary" light fluid arrow="down">
            {hero.secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
