"use client";

import { useStill } from "@/lib/motionPrefs";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

/** Counts from 0 to `to` with a bounceless spring the first time it scrolls into view. */
export function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useStill();
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const a = animate(value, to, { type: "spring", bounce: 0, visualDuration: 1.4 });
    return () => a.stop();
  }, [inView, reduced, to, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{to}</span>
      {/* Fixed width so the growing number never shifts layout. */}
      <motion.span aria-hidden className="inline-block text-end" style={{ width: `${String(to).length}ch` }}>
        {text}
      </motion.span>
    </span>
  );
}
