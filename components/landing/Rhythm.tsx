'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { rhythm } from '@/lib/landing/content';
import { Button } from './Button';
import { ArrowLeftIcon, ArrowRightIcon, Icon } from './Icon';
import { Lines } from './Lines';

/**
 * The list changes height as different steps expand. To stop the page below from jumping, the list is
 * given the height of its tallest state: every state is measured once (with transitions off, before paint)
 * and again whenever the list's width changes or fonts finish loading.
 */
function useStableListHeight(listRef: React.RefObject<HTMLOListElement | null>, activeRef: React.RefObject<number>) {
  useLayoutEffect(() => {
    const list = listRef.current;
    const parent = list?.parentElement;
    if (!list || !parent) return;
    let lastWidth = -1;

    const measure = () => {
      const rows = Array.from(list.children) as HTMLElement[];
      list.classList.add('is-measuring');
      list.style.minHeight = '0px';
      let tallest = 0;
      rows.forEach((_, i) => {
        rows.forEach((row, j) => row.classList.toggle('is-active', j === i));
        tallest = Math.max(tallest, Math.ceil(list.getBoundingClientRect().height));
      });
      rows.forEach((row, j) => row.classList.toggle('is-active', j === activeRef.current));
      list.style.minHeight = `${tallest}px`;
      list.classList.remove('is-measuring');
    };

    const observer = new ResizeObserver(() => {
      const width = parent.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      measure();
    });
    observer.observe(parent);
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, [listRef, activeRef]);
}

/** How long the slide that is leaving stays on screen (the longest of its exit animations in motion.css). */
const SWIPE_EXIT_MS = 1000;

/**
 * Mobile card: the viewport is as tall as the open slide and eases to the next one's height, so the
 * buttons below move smoothly instead of jumping. The open slide is in the normal flow, so before this
 * runs (and without JavaScript) the height is simply its own.
 */
function useCardHeight(viewportRef: React.RefObject<HTMLDivElement | null>, active: number) {
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const slide = viewport?.querySelector<HTMLElement>('.card__slide.is-active');
    if (!viewport || !slide) return;
    const apply = () => {
      const height = slide.offsetHeight;
      if (height) viewport.style.height = `${height}px`; // 0 while the card is hidden (tablet and up)
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(slide);
    document.fonts?.ready.then(apply).catch(() => {});
    return () => observer.disconnect();
  }, [viewportRef, active]);
}

export function Rhythm() {
  const [active, setActive] = useState(0);
  const count = rhythm.steps.length;
  const go = (index: number) => setActive((index + count) % count);
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef(0);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
  useStableListHeight(listRef, activeRef);

  // Mobile card: +1 (next) swipes the text to the left, -1 (previous) swipes it to the right.
  const [dir, setDir] = useState<1 | -1>(1);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  useCardHeight(viewportRef, active);
  const swipe = (delta: 1 | -1) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDir(delta);
    setMoved(true);
    setLeaving(reduce ? null : active);
    setActive((active + delta + count) % count);
  };
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), SWIPE_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, active]);

  return (
    <section id="philosophy" className="rhythm-section" aria-labelledby="rhythm-title">
      {/* Immersive photo with the chapter headline */}
      <div className="immersive">
        <Image
          src={rhythm.image}
          alt={rhythm.imageAlt}
          fill
          sizes="100vw"
          className="cover"
        />
        <div className="immersive__scrim" aria-hidden="true" />
        <div className="immersive__content container">
          <div className="immersive__left">
            <p className="eyebrow eyebrow--light">{rhythm.eyebrow}</p>
            <h2 id="rhythm-title" className="h2 h2--light">
              <Lines text={rhythm.headline} />
            </h2>
          </div>
          <div className="immersive__right">
            <p className="lead lead--light">{rhythm.body}</p>
            <p className="lead lead--light">{rhythm.lead}</p>
          </div>
        </div>
      </div>

      {/* Five-step stepper */}
      <div id="how-it-works" className="rhythm">
        <div className="container rhythm__grid">
          <div className="rhythm__stage">
            {rhythm.steps.map((step, i) => (
              <Image
                key={step.n}
                src={step.image}
                alt={i === active ? step.imageAlt : ''}
                aria-hidden={i === active ? undefined : true}
                fill
                sizes="(min-width: 1280px) 668px, (min-width: 768px) 46vw, 100vw"
                className={`cover rhythm__image ${i === active ? 'is-active' : ''}`}
              />
            ))}
            <div className="rhythm__controls">
              <button type="button" className="round-btn" aria-label="Previous step" onClick={() => go(active - 1)}>
                <ArrowLeftIcon />
              </button>
              <button type="button" className="round-btn" aria-label="Next step" onClick={() => go(active + 1)}>
                <ArrowRightIcon />
              </button>
            </div>
          </div>

          {/* Mobile only: one step at a time. The text swipes in the direction of the button that was tapped. */}
          <div className="rhythm__card" data-dir={dir === 1 ? 'next' : 'prev'} data-moved={moved ? '' : undefined}>
            <div ref={viewportRef} className="card__viewport">
              {rhythm.steps.map((step, i) => (
                <div
                  key={step.n}
                  className={`card__slide ${i === active ? 'is-active' : ''} ${i === leaving ? 'is-leaving' : ''}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Step ${step.n} of ${String(count).padStart(2, '0')}: ${step.title}`}
                  aria-hidden={i === active ? undefined : true}
                >
                  <div className="card__head" style={{ '--ci': 0 } as React.CSSProperties}>
                    <span className="card__badge" aria-hidden="true">
                      <Icon name={step.icon} size={20} />
                    </span>
                    <h3 className="card__title">{step.title}</h3>
                  </div>
                  <p className="card__line" style={{ '--ci': 1 } as React.CSSProperties}>
                    {step.line}
                  </p>
                  <p className="card__desc" style={{ '--ci': 2 } as React.CSSProperties}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="card__nav">
              <button type="button" className="round-btn round-btn--outline" aria-label="Previous step" onClick={() => swipe(-1)}>
                <ArrowLeftIcon />
              </button>
              <p className="card__count">
                <span className="sr-only" aria-live="polite">{`Step ${rhythm.steps[active].n} of ${String(count).padStart(2, '0')}`}</span>
                <span className="card__num" aria-hidden="true">
                  <span key={active} className="card__num-now">
                    {rhythm.steps[active].n}
                  </span>
                  <span className="card__num-sep">/</span>
                  <span className="card__num-all">{String(count).padStart(2, '0')}</span>
                </span>
              </p>
              <button type="button" className="round-btn round-btn--outline" aria-label="Next step" onClick={() => swipe(1)}>
                <ArrowRightIcon />
              </button>
            </div>
          </div>

          <div className="rhythm__column">
            <ol ref={listRef} className="steps" aria-label="The five steps">
              {rhythm.steps.map((step, i) => {
                const isActive = i === active;
                return (
                  <li key={step.n} className={`step ${isActive ? 'is-active' : ''}`}>
                    <span className="step__num" aria-hidden="true">
                      {step.n}
                    </span>
                    <div className="step__content">
                      <h3 className="step__title">
                        <button
                          type="button"
                          className="step__trigger"
                          aria-expanded={isActive}
                          aria-controls={`step-desc-${i}`}
                          onClick={() => setActive(i)}
                        >
                          <span className="sr-only">{`Step ${step.n}: `}</span>
                          {step.title}
                        </button>
                      </h3>
                      <p className="step__line">{step.line}</p>
                      <div className="step__more" id={`step-desc-${i}`}>
                        <div className="step__more-inner">
                          <p className="step__desc">{step.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="step__aside" aria-hidden="true">
                      <span className="step__badge">
                        <Icon name={step.icon} size={24} />
                      </span>
                      <span className="step__thumb">
                        <Image src={step.image} alt="" fill sizes="80px" className="cover" />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Button href={rhythm.cta.href} variant="dark-outline" className="rhythm__cta">
              {rhythm.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
