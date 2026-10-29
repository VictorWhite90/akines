import Image from 'next/image';
import { closing } from '@/lib/landing/content';
import { Button } from './Button';
import { Lines } from './Lines';

export function FinalCta() {
  return (
    <section id="join" className="closing" aria-labelledby="closing-title">
      <div className="closing__photo">
        <Image
          src={closing.imageNarrow}
          alt={closing.imageAlt}
          fill
          sizes="100vw"
          className="cover pic-narrow"
        />
        <Image src={closing.image} alt="" aria-hidden="true" fill sizes="100vw" className="cover pic-wide" />
      </div>
      <div className="closing__content">
        <p className="eyebrow">{closing.eyebrow}</p>
        <h2 id="closing-title" className="closing__headline">
          <Lines text={closing.headline} />
        </h2>
        <p className="lead lead--muted closing__body">{closing.body}</p>
        <div className="closing__actions">
          <Button href={closing.primary.href} variant="dark-filled" size="large">
            {closing.primary.label}
          </Button>
          <Button href={closing.secondary.href} variant="dark-outline" icon="none" size="large">
            {closing.secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
