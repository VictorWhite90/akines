"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { STAGGER, STAGGER_MAX, spring } from "./motion";

/** Content is set down: it arrives 6px above its place and settles on a spring. `index` staggers the first six. */
export default function Settle({ index = 0, children, ...rest }: { index?: number; children: React.ReactNode } & HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  const delay = Math.min(index, STAGGER_MAX) * STAGGER;
  if (reduced) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay }} {...rest}>{children}</motion.div>;
  return <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.settle, delay }} {...rest}>{children}</motion.div>;
}
