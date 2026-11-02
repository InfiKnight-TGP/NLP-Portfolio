"use client";

import dynamic from "next/dynamic";
import { motion, useTransform, type MotionValue } from "motion/react";
import { PinnedScene } from "../motion/PinnedScene";
import { CAPTIONS } from "./caseSceneData";

const CaseScene = dynamic(() => import("./CaseScene").then((m) => m.CaseScene), { ssr: false });

function Caption({ progress, i }: { progress: MotionValue<number>; i: number }) {
  const { range, title, text } = CAPTIONS[i];
  const [a, b] = range;
  const first = i === 0;
  const last = i === CAPTIONS.length - 1;
  const opacity = useTransform(progress, [a, a + 0.03, b - 0.03, b], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, [a, a + 0.03], [first ? 0 : 12, 0]);
  return (
    <motion.li style={{ opacity, y }} className="absolute inset-x-0 top-0 still:static still:transform-none! still:opacity-100!">
      <p className="text-[0.8125rem] font-semibold text-fg-3">
        {i + 1} / {CAPTIONS.length}
      </p>
      <h3 className="display mt-1 text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)]">{title}</h3>
      <p className="mt-2 text-fg-2">{text}</p>
    </motion.li>
  );
}

export function CasePinned() {
  return (
    <PinnedScene id="case-scene" label="Illustrative vector space: from static word vectors to contextual vectors, analogy and cosine similarity" length={340}>
      {(progress, near) => (
        <div className="mx-auto grid h-full w-full max-w-[68rem] grid-rows-[auto_1fr] gap-4 px-5 pt-16 pb-6 sm:px-8 md:grid-cols-[1fr_1.2fr] md:grid-rows-1 md:items-center md:gap-12 still:h-auto still:py-16">
          <div>
            <span className="rounded-full bg-[var(--hairline)] px-2.5 py-1 text-[0.75rem] font-semibold text-fg-2">
              Illustrative: hand-placed 2-D points, not a trained model
            </span>
            <ol className="relative mt-5 min-h-[9.5rem] still:min-h-0 still:space-y-6">
              {CAPTIONS.map((_, i) => (
                <Caption key={i} progress={progress} i={i} />
              ))}
            </ol>
          </div>
          <div className="card relative aspect-[250/175] w-full self-start p-2 sm:p-4 md:self-auto">{near && <CaseScene progress={progress} />}</div>
        </div>
      )}
    </PinnedScene>
  );
}
