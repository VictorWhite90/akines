'use client';

import { useEffect } from 'react';
import { initMotion } from './motion';

/** Starts scroll reveals, the hero scrub and eased anchor scrolling (see motion.ts). Renders nothing. */
export function Motion() {
  useEffect(() => initMotion(), []);
  return null;
}
