"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useMotionValueEvent, type MotionValue } from "motion/react";

// Each section washes the page in its own faint tint; tints cross-fade with scroll position.
const TINTS = [
  { id: "stars", cls: "bg-[var(--tint-stars)]" },
  { id: "case-study", cls: "bg-[var(--tint-case)]" },
  { id: "project", cls: "bg-[var(--tint-project)]" },
  { id: "hands-on", cls: "bg-[var(--tint-hands)]" },
  { id: "class", cls: "bg-[var(--tint-class)]" },
];

function Layer({ cls, opacity }: { cls: string; opacity: MotionValue<number> }) {
  return <motion.div aria-hidden style={{ opacity }} className={`fixed inset-0 -z-10 ${cls}`} />;
}

export function ScrollTint() {
  const { scrollY } = useScroll();
  const opacities = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const spans = useRef<{ top: number; bottom: number }[]>([]);

  function update() {
    const vh = window.innerHeight;
    const mid = scrollY.get() + vh / 2;
    const fade = vh * 0.5;
    spans.current.forEach(({ top, bottom }, i) => {
      // 1 while the viewport centre is inside the section, easing to 0 over half a viewport outside it.
      const d = mid < top ? top - mid : mid > bottom ? mid - bottom : 0;
      opacities[i].set(Math.max(0, 1 - d / fade));
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
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure once; update reads refs
  }, []);

  useMotionValueEvent(scrollY, "change", update);

  return (
    <>
      {TINTS.map((t, i) => (
        <Layer key={t.id} cls={t.cls} opacity={opacities[i]} />
      ))}
    </>
  );
}
