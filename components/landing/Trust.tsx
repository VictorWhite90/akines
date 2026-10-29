'use client';

import Image from 'next/image';
import { useState } from 'react';
import { trust } from '@/lib/landing/content';
import { DiscoveryLink } from './DiscoveryLink';
import { Icon, PauseIcon, PlayIcon } from './Icon';
import { Lines } from './Lines';

/**
 * Matching and trust: intro plus a full-bleed stage that moves through four principles.
 *
 * Auto-advance is driven by the chip loader's CSS animation: when the active chip's loader finishes
 * (trust.autoAdvanceSeconds), the stage moves on. Hovering the stage does not pause it. The animation is
 * paused while the stage has keyboard focus, can be paused with a button, and does not run at all when
 * the visitor prefers reduced motion (so nothing advances on its own).
 */
export function Trust() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Bumped on every manual selection so the loader restarts from zero.
  const [run, setRun] = useState(0);
  const count = trust.steps.length;

  const select = (index: number) => {
    setActive(index);
    setRun((r) => r + 1);
  };

  return (
    <section id="trust" className="trust" aria-labelledby="trust-title">
      <div className="container">
        <div className="intro intro--trust">
          <div className="intro__left">
            <p className="eyebrow">{trust.eyebrow}</p>
            <h2 id="trust-title" className="h2">
              <Lines text={trust.headline} />
            </h2>
          </div>
          <div className="intro__right">
            <p className="lead lead--muted">{trust.body}</p>
            <DiscoveryLink href={trust.cta.href}>{trust.cta.label}</DiscoveryLink>
          </div>
        </div>
      </div>

      <div className={`stage ${paused ? 'is-paused' : ''}`}>
        {trust.steps.map((step, i) => (
          <Image
            key={step.chip}
            src={step.image}
            alt={i === active ? step.imageAlt : ''}
            aria-hidden={i === active ? undefined : true}
            fill
            sizes="100vw"
            className={`cover stage__image ${i === active ? 'is-active' : ''}`}
          />
        ))}
        <div className="stage__scrim" aria-hidden="true" />

        <div className="stage__body container">
          <div className="stage__copy">
            {trust.steps.map((step, i) => (
              <div
                key={step.chip}
                className={`stage__slide ${i === active ? 'is-active' : ''}`}
                aria-hidden={i === active ? undefined : true}
              >
                <p className="stage__eyebrow">{step.eyebrow}</p>
                <p className="stage__headline">
                  <Lines text={step.headline} />
                </p>
              </div>
            ))}
          </div>

          <ul className="chips" aria-label="Trust principles">
            {trust.steps.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={step.chip} className="chips__item">
                  <button
                    type="button"
                    className={`chip ${isActive ? 'is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => select(i)}
                  >
                    {isActive ? (
                      <span
                        key={run}
                        className="chip__loader"
                        style={{ animationDuration: `${trust.autoAdvanceSeconds}s` }}
                        onAnimationEnd={() => select((active + 1) % count)}
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon name={step.icon} size={18} className="chip__icon" />
                    <span className="chip__label">{step.chip}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="stage__pause"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            <span>{paused ? 'Resume automatic changes' : 'Pause automatic changes'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
