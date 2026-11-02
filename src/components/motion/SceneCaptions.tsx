"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

export type Step = { range: number[]; title: string; text: string };

function Caption({ progress, steps, i }: { progress: MotionValue<number>; steps: Step[]; i: number }) {
  const [a, b] = steps[i].range;
  const first = i === 0;
  const last = i === steps.length - 1;
  const opacity = useTransform(progress, [a, a + 0.03, b - 0.03, b], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, [a, a + 0.03], [first ? 0 : 12, 0]);
  return (
    <motion.li style={{ opacity, y }} className="absolute inset-x-0 top-0 still:static still:transform-none! still:opacity-100!">
      <p className="text-[0.8125rem] font-semibold text-fg-3">
        {i + 1} / {steps.length}
      </p>
      <h3 className="display mt-1 text-[clamp(1.375rem,1.1rem+1.3vw,2.25rem)]">{steps[i].title}</h3>
      <p className="mt-2 text-fg-2">{steps[i].text}</p>
    </motion.li>
  );
}

/** Step captions that cross-fade with scene progress; a plain list when motion is still. */
export function SceneCaptions({ progress, steps, className = "" }: { progress: MotionValue<number>; steps: Step[]; className?: string }) {
  return (
    <ol className={`relative still:min-h-0 still:space-y-6 ${className}`}>
      {steps.map((_, i) => (
        <Caption key={i} progress={progress} steps={steps} i={i} />
      ))}
    </ol>
  );
}
