"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useLayoutEffect, useRef, type ComponentProps } from "react";

type Resolver = React.MutableRefObject<(() => void) | null>;
const Ctx = createContext<Resolver | null>(null);

/**
 * Shared-element moves across App Router navigations, through the browser's View Transitions API.
 * Framer Motion's layoutId cannot do this: the old page unmounts before the new one mounts.
 * Wrap the app once; give the element the same `view-transition-name` on both pages; navigate with <TransitionLink>.
 * Browsers without the API, and people who prefer reduced motion, get a plain navigation.
 */
export function ViewTransitions({ children }: { children: React.ReactNode }) {
  const resolver = useRef<(() => void) | null>(null);
  const pathname = usePathname();
  // Runs after the new route's DOM is committed, which is when the transition may take its "new" snapshot.
  useLayoutEffect(() => {
    resolver.current?.();
    resolver.current = null;
  }, [pathname]);
  return <Ctx.Provider value={resolver}>{children}</Ctx.Provider>;
}

function supported() {
  return typeof document !== "undefined" && "startViewTransition" in document && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Starts a view transition around a navigation. Returns false when it fell back to a plain navigation. */
export function useTransitionNavigate() {
  const resolver = useContext(Ctx);
  return (go: () => void): boolean => {
    if (!resolver || !supported()) {
      go();
      return false;
    }
    const doc = document as Document & { startViewTransition: (cb: () => Promise<void>) => void };
    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          resolver.current = resolve;
          // If the route takes too long, let the transition finish rather than hold the page.
          setTimeout(resolve, 1500);
          startTransition(go);
        }),
    );
    return true;
  };
}

export function TransitionLink({ href, onClick, children, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const navigate = useTransitionNavigate();
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(() => router.push(href));
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Back with the same transition in reverse. */
export function useTransitionBack(fallback = "/") {
  const navigate = useTransitionNavigate();
  const router = useRouter();
  return () => navigate(() => (window.history.length > 1 ? router.back() : router.push(fallback)));
}
