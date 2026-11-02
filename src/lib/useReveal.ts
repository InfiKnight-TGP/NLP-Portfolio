"use client";

import { useEffect } from "react";

/**
 * One-time reveal without React state or a motion component: elements that start below the
 * fold get data-reveal="out" at hydration and "in" when they enter view; CSS transitions do the rest.
 * Content already on screen (or without JS) is never hidden.
 */
export function useReveal(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    let first = true;
    // The observer's first (async) callback says where the element starts: no forced layout here.
    const io = new IntersectionObserver(
      ([e]) => {
        if (first) {
          first = false;
          if (!e.isIntersecting && e.boundingClientRect.top > 0) el.dataset.reveal = "out";
          else return io.disconnect();
        } else if (e.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
