"use client";

import { motion, useSpring } from "motion/react";
import { useStill } from "@/lib/motionPrefs";

const PULL = 0.18;
const MAX = 6; // px
const SPRING = { bounce: 0.25, visualDuration: 0.35 };

/** Leans gently toward a mouse pointer and springs back when it leaves. */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const still = useStill();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const clampPx = (v: number) => Math.max(-MAX, Math.min(MAX, v));

  return (
    <motion.div
      style={{ x, y }}
      className={className}
      onPointerMove={(e) => {
        if (still || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(clampPx((e.clientX - (r.left + r.width / 2)) * PULL));
        y.set(clampPx((e.clientY - (r.top + r.height / 2)) * PULL));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
