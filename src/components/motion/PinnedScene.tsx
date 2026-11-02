"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { useNear, useStill } from "@/lib/motionPrefs";

/**
 * A tall wrapper with a sticky stage. Native scroll drives `progress` (0 to 1) through the
 * wrapper; nothing hijacks the wheel or touch. When motion is still (reduced or paused) the
 * wrapper collapses to the stage and the scene gets progress = 1: its final composition.
 * `near` turns true once the wrapper approaches the viewport: mount heavy, lazily imported layers then.
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
  children: (progress: MotionValue<number>, near: boolean) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const near = useNear(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // One stable value for the scene: follows scroll, or sits at 1 (final state) when still.
  // Hooks downstream subscribe once, so the value object itself must never be swapped.
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => !still && progress.set(v));
  useEffect(() => progress.set(still ? 1 : scrollYProgress.get()), [still, progress, scrollYProgress]);

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
        {children(progress, near)}
      </div>
    </div>
  );
}
