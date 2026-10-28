"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { duration, spring } from "./motion";
import { usePhone } from "./useMedia";

/**
 * A sheet: slides up from the bottom on phones, a centred dialog on wider screens, or a drawer from the left.
 * Radix handles focus, Escape and scroll lock; motion handles the spring.
 */
export default function Sheet({ open, onClose, title, sub, side = "bottom", children }: { open: boolean; onClose: () => void; title: string; sub?: string; side?: "bottom" | "left"; children: React.ReactNode }) {
  const phone = usePhone();
  const reduced = useReducedMotion();
  const left = side === "left";
  const from = reduced ? { opacity: 0 } : left ? { x: "-100%" } : phone ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 8 };
  const to = reduced ? { opacity: 1 } : left ? { x: 0 } : phone ? { y: 0 } : { opacity: 1, scale: 1, y: 0 };
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="k-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: duration.state }} />
            </Dialog.Overlay>
            <div className={cn("k-sheet-layer", left && "left")}>
              <Dialog.Content asChild forceMount aria-describedby={sub ? undefined : undefined}>
                <motion.div className={cn("k-sheet", left && "left")} initial={from} animate={to} exit={from} transition={reduced ? { duration: 0.15 } : spring.layout}>
                  {!left && <div className="k-sheet-handle" aria-hidden />}
                  <div className="k-sheet-head">
                    <Dialog.Title className="t-title">{title}</Dialog.Title>
                    {sub ? <Dialog.Description className="t-body c-2">{sub}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                  </div>
                  {children}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
