import { Fragment } from 'react';

/**
 * Renders copy that contains "\n" as soft line breaks: the breaks show from tablet width up
 * (they match the Figma line breaks) and collapse into a space on mobile.
 * With `words`, every word is wrapped in a span with its index in `--wi`, so the words can animate
 * one after another (used by the hero headline; scroll-revealed headlines are split by motion.ts).
 */
export function Lines({ text, words = false }: { text: string; words?: boolean }) {
  const parts = text.split('\n');
  let n = 0;
  const render = (part: string) =>
    !words
      ? part
      : part.split(' ').map((word, i, all) => (
          <Fragment key={i}>
            <span className="w" style={{ '--wi': n++ } as React.CSSProperties}>
              {word}
            </span>
            {i < all.length - 1 ? ' ' : null}
          </Fragment>
        ));
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <>
              {' '}
              <br className="lb" />
            </>
          ) : null}
          {render(part)}
        </Fragment>
      ))}
    </>
  );
}
