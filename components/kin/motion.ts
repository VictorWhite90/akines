/** Motion tokens as Framer Motion transitions. Durations and springs match app/(kin)/tokens.css. */
export const spring = {
  press: { type: "spring", stiffness: 700, damping: 35 } as const,
  settle: { type: "spring", stiffness: 320, damping: 28 } as const,
  layout: { type: "spring", stiffness: 280, damping: 30 } as const,
  indicator: { type: "spring", stiffness: 520, damping: 40 } as const,
};
export const ease = { enter: [0.2, 0.8, 0.2, 1] as const, exit: [0.4, 0, 1, 1] as const };
export const duration = { press: 0.12, state: 0.2, enter: 0.26, layout: 0.32, reveal: 0.45 };
export const STAGGER = 0.035;
export const STAGGER_MAX = 6;
