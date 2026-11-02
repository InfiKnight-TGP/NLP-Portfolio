"use client";

import dynamic from "next/dynamic";
import { PinnedScene } from "../motion/PinnedScene";
import { SceneCaptions } from "../motion/SceneCaptions";
import { STEPS } from "./handsSceneData";
import data from "@/data/nltk-pipeline.json";

const HandsScene = dynamic(() => import("./HandsScene").then((m) => m.HandsScene), { ssr: false });

export function HandsPinned() {
  return (
    <PinnedScene id="hands-scene" label="NLTK pipeline on one sentence, step by step as you scroll" length={380}>
      {(progress, near) => (
        <div className="mx-auto grid h-full w-full max-w-[68rem] content-center gap-5 px-5 pt-14 pb-6 sm:px-8 md:grid-cols-[1fr_1.3fr] md:items-center md:gap-12 still:h-auto still:py-16">
          <div>
            <p className="eyebrow">Hands-On Session</p>
            <p className="mt-2 font-mono text-[0.8125rem] text-fg-3">“{data.scene.sentence}”</p>
            <SceneCaptions progress={progress} steps={STEPS} className="mt-4 min-h-[9rem] sm:min-h-[10.5rem]" />
          </div>
          <div className="card p-4 sm:p-6">
            {near && <HandsScene progress={progress} />}
            <p className="mt-4 text-[0.75rem] text-fg-3">Real NLTK {data.nltkVersion} output, saved as static JSON.</p>
          </div>
        </div>
      )}
    </PinnedScene>
  );
}
