"use client";

import dynamic from "next/dynamic";
import { motion, useTransform, type MotionValue } from "motion/react";
import { stars } from "@/lib/content";
import { PinnedScene } from "../motion/PinnedScene";

const StarsSky = dynamic(() => import("./StarsSky").then((m) => m.StarsSky), { ssr: false });

function Count({ progress }: { progress: MotionValue<number> }) {
  // Tied to scroll: reaches 15 at 85 % of the scene and holds.
  const text = useTransform(progress, (p) => String(Math.round(stars.total * Math.min(1, p / 0.85))));
  return (
    <span className="tabular-nums">
      <span className="sr-only">{stars.total}</span>
      <motion.span aria-hidden className="inline-block" style={{ width: `${String(stars.total).length}ch` }}>
        {text}
      </motion.span>
    </span>
  );
}

export function StarsPinned() {
  return (
    <PinnedScene id="stars-scene" label="Stars: a constellation of notable moments, drawn as you scroll" length={320}>
      {(progress, near) => (
        <div className="mx-auto flex h-full w-full max-w-[68rem] flex-col px-5 pt-16 pb-6 sm:px-8 sm:pt-20 still:h-auto">
          <p className="eyebrow">Stars</p>
          <h2 id="stars-title" className="display mt-2 text-[clamp(2.75rem,2rem+5vw,5.5rem)]">
            <Count progress={progress} /> stars
          </h2>
          <p className="lead mt-3 max-w-[34rem]">{stars.intro}</p>
          <div className="relative mt-5 min-h-[18rem] flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-[radial-gradient(120%_90%_at_50%_0%,#1b2550_0%,#0b1027_55%,#05070f_100%)] still:min-h-[26rem]">
            {near && <StarsSky progress={progress} />}
          </div>
        </div>
      )}
    </PinnedScene>
  );
}
