"use client";

import { useRef } from "react";
import { useMotionValue, useScroll, type MotionValue } from "motion/react";
import { useNear, useStill } from "@/lib/motionPrefs";

/**
 * A tall wrapper with a sticky stage. Native scroll drives `progress` (0 to 1) through the
 * wrapper; nothing hijacks the wheel or touch. When motion is still (reduced or paused) the
 * wrapper collapses to the stage and the scene gets progress = 1: its final composition.
 * The scene itself is lazy: `children` is only rendered once the wrapper nears the viewport.
 */
export function PinnedScene({
  id,
  label,
  length = 300,
  children,
}: {
  id?: string;
  label: string;
  /** Wrapper height in svh: how much scroll the scene lasts. */
  length?: number;
  children: (progress: MotionValue<number>) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const near = useNear(ref, "150% 0px");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const done = useMotionValue(1);

  return (
    <div
      ref={ref}
      id={id}
      role="group"
      aria-label={label}
      className="relative still:h-auto!"
      style={{ height: `${length}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden still:static still:h-auto still:min-h-[100svh]">
        {near && children(still ? done : scrollYProgress)}
      </div>
    </div>
  );
}
