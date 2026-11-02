"use client";

import dynamic from "next/dynamic";
import { PinnedScene } from "../motion/PinnedScene";
import { SceneCaptions } from "../motion/SceneCaptions";
import { CAPTIONS } from "./caseSceneData";

const CaseScene = dynamic(() => import("./CaseScene").then((m) => m.CaseScene), { ssr: false });

export function CasePinned() {
  return (
    <PinnedScene id="case-scene" label="Illustrative vector space: from static word vectors to contextual vectors, analogy and cosine similarity" length={340}>
      {(progress, near) => (
        <div className="mx-auto grid h-full w-full max-w-[68rem] grid-rows-[auto_1fr] gap-4 px-5 pt-16 pb-6 sm:px-8 md:grid-cols-[1fr_1.2fr] md:grid-rows-1 md:items-center md:gap-12 still:h-auto still:py-16">
          <div>
            <span className="rounded-full bg-[var(--hairline)] px-2.5 py-1 text-[0.75rem] font-semibold text-fg-2">
              Illustrative: hand-placed 2-D points, not a trained model
            </span>
            <SceneCaptions progress={progress} steps={CAPTIONS} className="mt-5 min-h-[9.5rem]" />
          </div>
          <div className="card relative aspect-[250/175] w-full self-start p-2 sm:p-4 md:self-auto">{near && <CaseScene progress={progress} />}</div>
        </div>
      )}
    </PinnedScene>
  );
}
