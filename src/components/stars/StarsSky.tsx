"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { stars } from "@/lib/content";
import { useAmbientActive, useStill } from "@/lib/motionPrefs";
import { StarIcon } from "./StarIcon";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(8);
const layer = (n: number, size: number, o: number) =>
  Array.from({ length: n }, () => ({ x: rand() * 100, y: rand() * 130, s: size * (0.6 + rand() * 0.8), o: o * (0.6 + rand() * 0.4) }));
// Far, middle and near layers: smaller, dimmer and slower the further away.
const LAYERS = [
  { dots: layer(70, 1.2, 0.45), shift: -40 },
  { dots: layer(36, 1.8, 0.65), shift: -110 },
  { dots: layer(16, 2.6, 0.85), shift: -200 },
];
// The constellation, in order (percent of the sky).
const POINTS: [number, number][] = [
  [9, 64], [21, 42], [33, 58], [46, 32], [57, 52], [69, 28], [80, 47], [91, 30],
];
const DRAW: [number, number] = [0.08, 0.85];

function Layer({ dots, shift, progress }: (typeof LAYERS)[number] & { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [0, shift]);
  return (
    <motion.div style={{ y }} className="absolute inset-x-0 top-0 h-[130%] still:transform-none!">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${d.x}%`, top: `${(d.y / 130) * 100}%`, width: d.s, height: d.s, opacity: d.o }}
        />
      ))}
    </motion.div>
  );
}

function Node({ i, at, draw }: { i: number; at: number; draw: MotionValue<number> }) {
  const m = stars.moments[i];
  const on = useTransform(draw, [Math.max(0, at - 0.04), at], [0, 1]); // lights up as the line arrives
  const scale = useTransform(on, [0, 1], [0.3, 1]);
  const [x, y] = POINTS[i];
  return (
    <motion.div
      style={{ left: `${x}%`, top: `${y}%`, opacity: on, scale }}
      className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
    >
      <span className="relative grid place-items-center text-star">
        <span className="absolute h-14 w-14 rounded-full bg-[radial-gradient(circle,rgb(255_201_51/0.35),transparent_70%)]" />
        <StarIcon className={m.count > 1 ? "relative h-8 w-8" : "relative h-6 w-6"} />
      </span>
      <span className="mt-1 hidden text-[0.75rem] leading-snug font-medium text-white/85 md:block">{m.title}</span>
    </motion.div>
  );
}

export function StarsSky({ progress }: { progress: MotionValue<number> }) {
  const box = useRef<HTMLDivElement>(null);
  const still = useStill();
  const active = useAmbientActive(box);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const draw = useTransform(progress, DRAW, [0, 1]);
  const fadeIn = useTransform(progress, [0, 0.06], [0.35, 1]);

  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Path in real pixels so dash progress matches what you see; stars appear as the line reaches them.
  const pts = POINTS.map(([x, y]) => [(x / 100) * size.w, (y / 100) * size.h]);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  const at = pts.map((_, i) => seg.slice(0, i).reduce((a, b) => a + b, 0) / total);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  // Caption follows the most recently drawn star.
  const caption = useTransform(draw, (v) => {
    let i = 0;
    at.forEach((a, k) => v >= a && (i = k));
    const m = stars.moments[i];
    return `${m.count} ${m.count === 1 ? "star" : "stars"} · ${m.title}`;
  });

  // A shooting star crosses only on fast scrolls (and never when motion is still).
  const { scrollY } = useScroll();
  const speed = useVelocity(scrollY);
  const sx = useMotionValue(-30);
  const so = useMotionValue(0);
  const cooling = useRef(false);
  useMotionValueEvent(speed, "change", (v) => {
    if (!active || still || cooling.current || Math.abs(v) < 2400) return;
    cooling.current = true;
    sx.set(-30);
    animate(sx, 130, { duration: 0.9, ease: [0.3, 0, 0.2, 1] });
    animate(so, [0, 0.9, 0], { duration: 0.9, times: [0, 0.3, 1] });
    setTimeout(() => (cooling.current = false), 3500);
  });
  const shootX = useTransform(sx, (v) => `${v}%`);

  useEffect(() => () => so.stop(), [so]);

  return (
    <motion.div ref={box} style={{ opacity: fadeIn }} aria-hidden className="absolute inset-0">
      {LAYERS.map((l, i) => (
        <Layer key={i} {...l} progress={progress} />
      ))}

      <motion.div style={{ x: shootX, opacity: so }} className="absolute top-[18%] left-0 h-px w-[22%] -rotate-12 bg-gradient-to-r from-transparent to-white" />

      {size.w > 0 && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`}>
          <motion.path
            d={d}
            fill="none"
            stroke="rgb(255 214 110 / 0.75)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: draw }}
          />
        </svg>
      )}
      {size.w > 0 && POINTS.map((_, i) => <Node key={i} i={i} at={at[i]} draw={draw} />)}

      <motion.p className="absolute inset-x-0 bottom-4 px-4 text-center text-[0.875rem] font-medium text-white/90">
        {caption}
      </motion.p>
    </motion.div>
  );
}
