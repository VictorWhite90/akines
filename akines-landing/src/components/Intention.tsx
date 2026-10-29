import Image from 'next/image';
import { intention } from '@/content/content';
import { DiscoveryLink } from './DiscoveryLink';
import { Icon } from './Icon';
import { Lines } from './Lines';

type Panel = (typeof intention.panels)[number];

function PanelCard({ panel }: { panel: Panel }) {
  return (
    <article
      className={`panel panel--${panel.shape}`}
      style={{ '--order': panel.order } as React.CSSProperties}
    >
      <div className="panel__media">
        <Image
          src={panel.image}
          alt={panel.imageAlt}
          fill
          sizes="(min-width: 1280px) 668px, (min-width: 768px) 46vw, 100vw"
          className="cover"
        />
      </div>
      <div className="panel__caption">
        <p className="label-row">
          <Icon name={panel.icon} size={20} />
          <span className="eyebrow">{panel.label}</span>
        </p>
        <h3 className="panel__heading">{panel.heading}</h3>
        <p className="panel__body">{panel.body}</p>
        <DiscoveryLink href={panel.href}>{panel.cta}</DiscoveryLink>
      </div>
    </article>
  );
}

export function Intention() {
  const [a, b] = [
    intention.panels.filter((p) => p.order % 2 === 1),
    intention.panels.filter((p) => p.order % 2 === 0),
  ];
  return (
    <section id="intention" className="section section--ivory intention" aria-labelledby="intention-title">
      <div className="container">
        <div className="intro">
          <div className="intro__left">
            <p className="eyebrow">{intention.eyebrow}</p>
            <h2 id="intention-title" className="h2">
              <Lines text={intention.headline} />
            </h2>
          </div>
          <div className="intro__right">
            <p className="lead lead--muted">{intention.body}</p>
            <p className="lead">{intention.lead}</p>
          </div>
        </div>

        <div className="intention__grid">
          <div className="intention__col">
            {a.map((p) => (
              <PanelCard key={p.id} panel={p} />
            ))}
          </div>
          <div className="intention__col intention__col--offset">
            {b.map((p) => (
              <PanelCard key={p.id} panel={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
