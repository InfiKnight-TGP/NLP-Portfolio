"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { caseStudy } from "@/lib/content";
import { project, settle } from "@/lib/physics";
import { useDrag } from "@/lib/useDrag";

const TONE: Record<string, string> = {
  "Word vectors": "bg-[#0071e3]/12 text-[#0058b0] dark:text-[#6cb4ff]",
  Contextual: "bg-[#8e44ad]/12 text-[#7a2e98] dark:text-[#d39cf0]",
  "Sentence vectors": "bg-[#c2410c]/12 text-[#a3360a] dark:text-[#ffa36e]",
  "Indian languages": "bg-[#15803d]/12 text-[#106631] dark:text-[#6fdc95]",
};

/** Snap carousel: 1:1 drag, momentum projected to the nearest card, rubber-band at both ends. */
export function Carousel() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const models = caseStudy.models;

  const min = () => Math.min(0, (viewport.current?.clientWidth ?? 0) - (track.current?.scrollWidth ?? 0));
  const snaps = () => {
    const items = [...(track.current?.children ?? [])] as HTMLElement[];
    return items.map((el) => Math.max(min(), -el.offsetLeft));
  };

  function goTo(i: number, velocity = 0) {
    const s = snaps();
    const next = Math.max(0, Math.min(s.length - 1, i));
    setIndex(next);
    setAtEnd(s[next] === min());
    settle(x, s[next], { velocity, flick: velocity !== 0, reduced });
  }

  const drag = useDrag({
    x: { mv: x, min, max: () => 0, size: () => viewport.current?.clientWidth ?? 400 },
    onRelease: ({ x: v }) => {
      const projected = x.get() + (reduced ? 0 : project(v));
      const s = snaps();
      let best = 0;
      s.forEach((p, i) => Math.abs(p - projected) < Math.abs(s[best] - projected) && (best = i));
      goTo(best, v);
    },
  });

  const btn =
    "press grid h-11 w-11 place-items-center rounded-full bg-[var(--hairline)] text-fg disabled:opacity-35 disabled:active:scale-100";

  return (
    <div>
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label="Embedding models. Drag, or use the arrow keys or the buttons below."
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(index + 1);
          else if (e.key === "ArrowLeft") goTo(index - 1);
          else return;
          e.preventDefault();
        }}
        onPointerDown={drag.onPointerDown}
        className="cursor-grab touch-pan-y overflow-visible rounded-[var(--radius-lg)] select-none active:cursor-grabbing"
      >
        <motion.ul ref={track} style={{ x }} className="flex w-max gap-4">
          {models.map((m, i) => (
            <li
              key={m.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${models.length}: ${m.name}`}
              className="card flex min-h-[15rem] w-[min(78vw,19rem)] flex-col p-6"
            >
              <span className={`self-start rounded-full px-2.5 py-1 text-[0.75rem] font-semibold ${TONE[m.kind]}`}>
                {m.kind}
              </span>
              <h3 className="display mt-10 text-[1.75rem]">{m.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-normal text-fg-2">{m.line}</p>
            </li>
          ))}
        </motion.ul>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[0.875rem] text-fg-3 tabular-nums" aria-live="polite">
          {models[index].name} · {index + 1} of {models.length}
        </p>
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous model">
            <Chevron dir={-1} />
          </button>
          <button type="button" className={btn} onClick={() => goTo(index + 1)} disabled={atEnd} aria-label="Next model">
            <Chevron dir={1} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden style={{ transform: `scaleX(${dir})` }}>
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
