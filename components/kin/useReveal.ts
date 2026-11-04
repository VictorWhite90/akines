"use client";

import { useEffect } from "react";

/*
 * Scroll reveals, ported from the product design's script. Elements opt in with data-m:
 * "up" rises in, "stagger" rises its children in turn, "words" rises a title word by word,
 * "frame" opens a curtain over a photo. Each plays once, as it enters the viewport; the styles
 * are in components/kin/akines/library.css. Nothing is hidden when motion is reduced.
 */
const UP = ['[data-m="up"]', '[data-m="stagger"] > *'];
const WORDS = ['[data-m="words"]'];
const FRAME = ['[data-m="frame"]'];

/** Wraps each word of a title in span.w with its index, so the words can rise one after another. */
function splitWords(el: Element) {
  if (el.querySelector(".w")) return;
  let i = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (n.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement("span");
          s.className = "w";
          s.style.setProperty("--wi", String(i++));
          s.textContent = part;
          frag.appendChild(s);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName !== "BR") walk(n);
    });
  };
  walk(el);
}

export function useReveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const pending = new Set<Element>();
    const show = (el: Element, order: number) => {
      if (!pending.delete(el)) return;
      io.unobserve(el);
      const delay = el.getAttribute("data-reveal") === "frame" ? 0 : Math.min(order, 8) * 100;
      (el as HTMLElement).style.setProperty("--rd", `${delay}ms`);
      el.setAttribute("data-in", "");
    };
    const io = new IntersectionObserver((entries) => {
      const groups = new Map<Element, number>();
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .forEach((e) => {
          const g = e.target.closest("section, footer, [data-m-group]") ?? document.body;
          const n = groups.get(g) ?? 0;
          groups.set(g, n + 1);
          show(e.target, n);
        });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0 });
    const tag = (sel: string[], kind: string) =>
      document.querySelectorAll(sel.join(",")).forEach((el) => {
        if (el.hasAttribute("data-reveal")) return;
        if (kind === "words") splitWords(el);
        el.setAttribute("data-reveal", kind);
      });
    const scan = () => {
      tag(UP, "up");
      tag(WORDS, "words");
      tag(FRAME, "frame");
      document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => {
        if (!pending.has(el)) { pending.add(el); io.observe(el); }
      });
    };
    scan();
    // New pages and late data bring new elements; anything already scrolled past shows at once.
    const mo = new MutationObserver((ms) => { if (ms.some((m) => m.addedNodes.length > 0)) scan(); });
    mo.observe(document.body, { childList: true, subtree: true });
    let t = 0;
    const passed = () => pending.forEach((el) => { if (el.getBoundingClientRect().bottom < 0) show(el, 0); });
    const onScroll = () => { clearTimeout(t); t = window.setTimeout(passed, 120); };
    passed();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); mo.disconnect(); removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, []);
}
