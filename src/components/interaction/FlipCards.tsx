"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { interaction } from "@/lib/content";
import { SPRING } from "@/lib/physics";

const face =
  "absolute inset-0 flex flex-col rounded-[var(--radius-lg)] p-7 [backface-visibility:hidden] motion-reduce:[backface-visibility:visible] motion-reduce:transition-opacity motion-reduce:duration-200";

function FlipCard({ kind, front, back }: (typeof interaction.cards)[number]) {
  const [flipped, setFlipped] = useState(false);
  return (
    <li className="[perspective:1200px]">
      <button
        type="button"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
        data-flipped={flipped}
        className="press group block h-[17rem] w-full rounded-[var(--radius-lg)] text-start"
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={SPRING}
          className="relative h-full w-full [transform-style:preserve-3d] motion-reduce:transform-none!"
        >
          <span
            aria-hidden={flipped}
            className={`${face} card motion-reduce:group-data-[flipped=true]:opacity-0`}
          >
            <span className="eyebrow">{kind}</span>
            <span className="display mt-auto text-[2.25rem]">{front}</span>
            <span className="mt-3 text-[0.875rem] text-fg-3">Tap to turn over</span>
          </span>
          <span
            aria-hidden={!flipped}
            className={`${face} bg-fg text-bg shadow-[var(--shadow-lg)] [transform:rotateY(180deg)] motion-reduce:transform-none! motion-reduce:opacity-0 motion-reduce:group-data-[flipped=true]:opacity-100`}
          >
            <span className="eyebrow text-bg/70!">{kind}</span>
            <span className="mt-auto text-[1.25rem] leading-snug font-semibold tracking-[-0.01em] text-pretty">
              {back}
            </span>
          </span>
        </motion.div>
      </button>
    </li>
  );
}

export function FlipCards() {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {interaction.cards.map((c) => (
        <FlipCard key={c.front} {...c} />
      ))}
    </ul>
  );
}
