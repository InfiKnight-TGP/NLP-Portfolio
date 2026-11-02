"use client";

import dynamic from "next/dynamic";
import { PinnedScene } from "../motion/PinnedScene";

const FisherScene = dynamic(() => import("./FisherScene").then((m) => m.FisherScene), { ssr: false });

export function FisherPinned() {
  return (
    <PinnedScene id="fisher-scene" label="Illustrative walkthrough of how rule-based signals add up, not the real engine" length={360}>
      {(progress, near) => (
        <div className="mx-auto flex h-full w-full max-w-[68rem] flex-col justify-center px-5 pt-14 pb-6 sm:px-8 still:h-auto still:py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="display text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)]">How the rule idea works</h3>
            <p className="text-[0.8125rem] font-semibold text-fg-3">Illustrative walkthrough, not the real engine.</p>
          </div>
          <div className="mt-4 sm:mt-5">{near && <FisherScene progress={progress} />}</div>
        </div>
      )}
    </PinnedScene>
  );
}
