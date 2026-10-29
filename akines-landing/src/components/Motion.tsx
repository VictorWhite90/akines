'use client';

import { useEffect } from 'react';
import { initMotion } from '@/lib/motion';

/** Starts scroll reveals, the hero scrub and eased anchor scrolling (see src/lib/motion.ts). Renders nothing. */
export function Motion() {
  useEffect(() => initMotion(), []);
  return null;
}
