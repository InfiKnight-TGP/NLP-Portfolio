"use client";

import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";

// Each section washes the page in its own faint tint; tints cross-fade with scroll position.
const TINTS = [
  { id: "stars", cls: "bg-[var(--tint-stars)]" },
  { id: "case-study", cls: "bg-[var(--tint-case)]" },
  { id: "project", cls: "bg-[var(--tint-project)]" },
  { id: "hands-on", cls: "bg-[var(--tint-hands)]" },
  { id: "class", cls: "bg-[var(--tint-class)]" },
];

export function ScrollTint() {
  const { scrollY } = useScroll();
  // Plain divs whose opacity is written directly: no React renders or motion components per frame.
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const spans = useRef<{ top: number; bottom: number }[]>([]);

  function update() {
    const vh = window.innerHeight;
    const mid = scrollY.get() + vh / 2;
    const fade = vh * 0.5;
    spans.current.forEach(({ top, bottom }, i) => {
      // 1 while the viewport centre is inside the section, easing to 0 over half a viewport outside it.
      const d = mid < top ? top - mid : mid > bottom ? mid - bottom : 0;
      const el = layers.current[i];
      if (el) el.style.opacity = String(Math.max(0, 1 - d / fade));
    });
  }

  useEffect(() => {
    const measure = () => {
      spans.current = TINTS.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { top: Infinity, bottom: -Infinity };
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
      });
      update();
    };
    // Measuring forces a full-page layout: keep it out of the load and hydration window.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    let ro: ResizeObserver | undefined;
    const id = ric(() => {
      ro = new ResizeObserver(measure);
      ro.observe(document.body); // fires once immediately, then on every size change
    });
    return () => {
      (window.cancelIdleCallback ?? window.clearTimeout)(id);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure once; update reads refs
  }, []);

  useMotionValueEvent(scrollY, "change", update);

  return (
    <>
      {TINTS.map((t, i) => (
        <div
          key={t.id}
          ref={(el) => void (layers.current[i] = el)}
          aria-hidden
          style={{ opacity: 0 }}
          className={`fixed inset-0 -z-10 ${t.cls}`}
        />
      ))}
    </>
  );
}
