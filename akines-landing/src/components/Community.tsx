import Image from 'next/image';
import { community } from '@/content/content';
import { Button } from './Button';
import { Icon } from './Icon';
import { Lines } from './Lines';

export function Community() {
  return (
    <section id="community" className="section section--ivory community" aria-labelledby="community-title">
      <div className="container community__stack">
        <div className="community__intro">
          <p className="eyebrow">{community.eyebrow}</p>
          <h2 id="community-title" className="h2">
            <Lines text={community.headline} />
          </h2>
          <p className="lead lead--muted">{community.body}</p>
        </div>

        <div className="community__photo">
          <Image
            src={community.imageNarrow}
            alt={community.imageAlt}
            fill
            sizes="100vw"
            className="cover pic-narrow"
          />
          <Image
            src={community.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1512px) 1384px, 100vw"
            className="cover pic-wide"
          />
        </div>

        <ul className="moments">
          {community.moments.map((m) => (
            <li key={m.text} className="moment">
              <Icon name={m.icon} size={24} className="moment__icon" />
              <p className="moment__text">
                <Lines text={m.text} />
              </p>
            </li>
          ))}
        </ul>

        <div className="invitation">
          <h3 className="invitation__headline">
            <Lines text={community.invitation.headline} />
          </h3>
          <div className="invitation__right">
            <p className="lead lead--muted">{community.invitation.body}</p>
            <Button href={community.invitation.cta.href} variant="dark-filled">
              {community.invitation.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
