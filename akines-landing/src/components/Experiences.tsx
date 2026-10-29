import Image from 'next/image';
import { experiences, type Experience } from '@/content/content';
import { DiscoveryLink } from './DiscoveryLink';
import { Icon } from './Icon';
import { Lines } from './Lines';

function Caption({
  item,
  tone = 'dark',
  size,
}: {
  item: Experience;
  tone?: 'dark' | 'light';
  size: 'small' | 'big';
}) {
  return (
    <div className={`caption caption--${size} caption--${tone}`}>
      <p className="label-row">
        <Icon name={item.icon} size={20} />
        <span className="eyebrow">{item.label}</span>
        {item.concept ? <span className="tag">Concept preview</span> : null}
      </p>
      <h3 className="caption__name">{item.name}</h3>
      <p className="caption__tagline">{item.tagline}</p>
      <p className="caption__body">{item.body}</p>
      <DiscoveryLink href={item.href} tone={tone}>
        {item.cta}
      </DiscoveryLink>
    </div>
  );
}

function FullCard({ item, align }: { item: Experience; align: 'left' | 'right' }) {
  return (
    <article id={item.id} className={`fullcard fullcard--${align}`}>
      <Image src={item.image} alt={item.imageAlt} fill sizes="100vw" className="cover" />
      <div className="fullcard__scrim" aria-hidden="true" />
      <div className="fullcard__inner container">
        <Caption item={item} tone="light" size="big" />
      </div>
    </article>
  );
}

function Story({
  item,
  size,
  ratio,
  offset,
}: {
  item: Experience;
  size: 'small' | 'big';
  ratio: 'portrait' | 'landscape' | 'wide';
  offset?: boolean;
}) {
  return (
    <article id={item.id} className={`story story--${size} ${offset ? 'story--offset' : ''}`}>
      <div className={`story__media story__media--${ratio}`}>
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes={size === 'big' ? '(min-width: 1280px) 880px, (min-width: 768px) 60vw, 100vw' : '(min-width: 1280px) 456px, (min-width: 768px) 30vw, 100vw'}
          className="cover"
        />
      </div>
      <Caption item={item} size={size} />
    </article>
  );
}

export function Experiences() {
  return (
    <section id="experiences" className="section--ivory experiences" aria-labelledby="experiences-title">
      <div className="container">
        <div className="intro intro--tight">
          <div className="intro__left">
            <p className="eyebrow">{experiences.eyebrow}</p>
            <h2 id="experiences-title" className="h2">
              <Lines text={experiences.headline} />
            </h2>
          </div>
          <div className="intro__right">
            <p className="lead lead--muted">{experiences.body}</p>
          </div>
        </div>
      </div>

      <FullCard item={experiences.kincircle} align="left" />

      <div className="container story-row story-row--a">
        <Story item={experiences.banter} size="small" ratio="portrait" offset />
        <Story item={experiences.create} size="big" ratio="landscape" />
      </div>

      <FullCard item={experiences.myStore} align="right" />

      <div className="container story-row story-row--b">
        <Story item={experiences.playTogether} size="big" ratio="wide" />
        <Story item={experiences.wellbeing} size="small" ratio="portrait" offset />
      </div>
    </section>
  );
}
