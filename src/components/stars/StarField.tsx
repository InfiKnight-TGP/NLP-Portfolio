"use client";

import { useStill } from "@/lib/motionPrefs";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { stars } from "@/lib/content";
import { clamp, project, settle } from "@/lib/physics";
import { useDrag } from "@/lib/useDrag";
import { StarCount, StarIcon } from "./StarIcon";
import { StarSheet } from "./StarSheet";

// Deterministic "random" sky so server and client render the same field.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(15);
const DUST = Array.from({ length: 70 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  s: 0.5 + rand() * 1.5,
  o: 0.25 + rand() * 0.55,
}));
const HEIGHTS = [26, 54, 22, 50, 30, 56, 24, 48];
const PAN_STEP = 240;

export function StarField() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useStill();
  const x = useMotionValue(0);
  const farX = useTransform(x, (v) => v * 0.45);
  const [open, setOpen] = useState<number | null>(null);

  const min = () => (viewport.current?.clientWidth ?? 0) - (track.current?.offsetWidth ?? 0);
  const size = () => viewport.current?.clientWidth ?? 400;

  const panTo = (target: number, velocity = 0, flick = false) =>
    settle(x, clamp(target, min(), 0), { velocity, flick, reduced });

  const drag = useDrag({
    x: { mv: x, min, max: () => 0, size },
    onRelease: ({ x: v }) => {
      // Released after a drag: project momentum, then spring with a little bounce.
      if (v !== 0 || x.get() > 0 || x.get() < min()) panTo(x.get() + (reduced ? 0 : project(v)), v, true);
    },
  });

  // Keyboard alternative: focusing a star brings it into view; arrow keys pan the sky.
  function reveal(i: number) {
    const el = starRefs.current[i];
    if (!el) return;
    const center = el.offsetLeft + el.offsetWidth / 2;
    panTo(size() / 2 - center);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const step = { ArrowLeft: PAN_STEP, ArrowRight: -PAN_STEP }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      panTo(x.get() + step);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      panTo(e.key === "Home" ? 0 : min());
    }
  }

  return (
    <>
      <div
        ref={viewport}
        role="region"
        aria-label="Star field of notable moments. Drag or use the arrow keys to pan; select a star for details."
        onKeyDown={onKeyDown}
        onPointerDown={drag.onPointerDown}
        onClickCapture={drag.onClickCapture}
        className="relative h-[26rem] cursor-grab touch-pan-y overflow-hidden rounded-[var(--radius-lg)] bg-[radial-gradient(120%_90%_at_50%_0%,#1b2550_0%,#0b1027_55%,#05070f_100%)] select-none active:cursor-grabbing"
      >
        {/* Edge fade lives inside the sky so it never bleeds into the page colour. */}
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)]">
        {/* Far layer: slower parallax for depth. */}
        <motion.div style={{ x: farX }} className="absolute inset-y-0 left-0 w-[max(200%,1700px)]" aria-hidden>
          {DUST.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s * 2, height: d.s * 2, opacity: d.o }}
            />
          ))}
        </motion.div>

        <motion.div ref={track} style={{ x }} className="absolute inset-y-0 left-0 w-[max(200%,1700px)]">
          <ul>
            {stars.moments.map((m, i) => (
              <li
                key={m.title}
                className="absolute flex w-44 -translate-x-1/2 flex-col items-center text-center"
                style={{ left: `${((i + 0.5) / stars.moments.length) * 100}%`, top: `${HEIGHTS[i]}%` }}
              >
                <button
                  ref={(el) => {
                    starRefs.current[i] = el;
                  }}
                  type="button"
                  onFocus={() => reveal(i)}
                  onClick={() => setOpen(i)}
                  aria-haspopup="dialog"
                  aria-label={`${m.count} ${m.count === 1 ? "star" : "stars"}: ${m.title}`}
                  className="press group relative grid place-items-center rounded-full p-2 text-star focus-visible:outline-white"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(255_201_51/0.35),transparent_70%)]"
                  />
                  <StarIcon className={m.count > 1 ? "relative h-12 w-12" : "relative h-9 w-9"} />
                </button>
                <span aria-hidden className="mt-2 text-[0.8125rem] leading-snug font-medium text-white/90">
                  {m.title}
                </span>
                <span aria-hidden className="mt-1">
                  <StarCount count={m.count} className="h-3 w-3" />
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
        </div>
      </div>
      <p className="mt-3 text-[0.875rem] text-fg-3">
        Drag or flick the sky, then tap a star. With a keyboard, Tab through the stars or use the
        arrow keys.
      </p>

      {open !== null && (
        <StarSheet
          moment={stars.moments[open]}
          origin={() => starRefs.current[open]}
          onClosed={() => {
            starRefs.current[open]?.focus({ preventScroll: true });
            setOpen(null);
          }}
        />
      )}
    </>
  );
}
