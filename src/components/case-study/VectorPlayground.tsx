"use client";

import { useStill } from "@/lib/motionPrefs";
import { useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { project, rubberband, SETTLE_REDUCED, SPRING, SPRING_FLICK } from "@/lib/physics";

// Hand-made 2-D coordinates for illustration only. They do not come from any trained model.
const WORDS = [
  { word: "puppy", x: 0.62, y: 0.62, color: "#0a84ff" },
  { word: "dog", x: 0.82, y: 0.42, color: "#0a84ff" },
  { word: "car", x: -0.35, y: 0.85, color: "#bf5af2" },
  { word: "truck", x: -0.62, y: 0.7, color: "#bf5af2" },
  { word: "mango", x: -0.55, y: -0.7, color: "#30a14e" },
  { word: "banana", x: -0.82, y: -0.42, color: "#30a14e" },
];
const R = 1.1; // the plane's usable radius; dragging beyond it rubber-bands
const MIN_R = 0.08;

function cosine(ax: number, ay: number, bx: number, by: number) {
  const n = Math.hypot(ax, ay) * Math.hypot(bx, by);
  return n === 0 ? 0 : (ax * bx + ay * by) / n;
}

export function VectorPlayground() {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useStill();
  const hx = useMotionValue(0.75);
  const hy = useMotionValue(0.2);
  const [nearest, setNearest] = useState(() => best(0.75, 0.2));

  function best(x: number, y: number) {
    return WORDS.reduce((a, w) => (cosine(x, y, w.x, w.y) > cosine(x, y, a.x, a.y) ? w : a)).word;
  }
  useMotionValueEvent(hx, "change", () => setNearest(best(hx.get(), hy.get())));
  useMotionValueEvent(hy, "change", () => setNearest(best(hx.get(), hy.get())));

  // Screen px -> plane units (the SVG y axis points down, the plane's points up).
  function toPlane(cx: number, cy: number) {
    const m = svg.current!.getScreenCTM()!.inverse();
    const p = new DOMPoint(cx, cy).matrixTransform(m);
    return { x: p.x / 100, y: -p.y / 100 }; // 100 SVG units per plane unit
  }

  /** Keeps the point inside the plane softly: radial rubber-band past R, minimum length near 0. */
  function place(x: number, y: number) {
    const r = Math.hypot(x, y);
    if (r > R) {
      const k = (R + rubberband(r - R, R, 0.4)) / r;
      return { x: x * k, y: y * k };
    }
    if (r < MIN_R) {
      const a = r === 0 ? 0 : Math.atan2(y, x);
      return { x: Math.cos(a) * MIN_R, y: Math.sin(a) * MIN_R };
    }
    return { x, y };
  }

  function settleInside(vx = 0, vy = 0) {
    const px = reduced ? hx.get() : hx.get() + project(vx);
    const py = reduced ? hy.get() : hy.get() + project(vy);
    const r = Math.hypot(px, py);
    const k = r > R ? R / r : 1;
    const flick = vx !== 0 || vy !== 0;
    const t = reduced ? SETTLE_REDUCED : flick ? SPRING_FLICK : SPRING;
    animate(hx, px * k, reduced ? t : { ...t, velocity: vx });
    animate(hy, py * k, reduced ? t : { ...t, velocity: vy });
  }

  function onPointerDown(e: React.PointerEvent<SVGElement>) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    hx.stop();
    hy.stop();
    const start = toPlane(e.clientX, e.clientY);
    const ox = hx.get();
    const oy = hy.get();
    const el = e.currentTarget;
    const move = (ev: PointerEvent) => {
      const p = toPlane(ev.clientX, ev.clientY);
      const q = place(ox + p.x - start.x, oy + p.y - start.y); // respects the grab offset
      hx.set(q.x);
      hy.set(q.y);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      settleInside(hx.getVelocity(), hy.getVelocity());
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const d = { ArrowLeft: [-0.06, 0], ArrowRight: [0.06, 0], ArrowUp: [0, 0.06], ArrowDown: [0, -0.06] }[e.key];
    if (!d) return;
    e.preventDefault();
    const q = place(hx.get() + d[0], hy.get() + d[1]);
    const r = Math.hypot(q.x, q.y);
    const k = r > R ? R / r : 1;
    animate(hx, q.x * k, reduced ? SETTLE_REDUCED : SPRING);
    animate(hy, q.y * k, reduced ? SETTLE_REDUCED : SPRING);
  }

  const lineX = useTransform(hx, (v) => v * 100);
  const lineY = useTransform(hy, (v) => -v * 100);

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="card relative p-3">
        <svg
          ref={svg}
          id="vector-plane"
          viewBox="-125 -125 250 250"
          className="block aspect-square w-full touch-none select-none"
          aria-hidden
        >
          {[0.5, 1].map((r) => (
            <circle key={r} r={r * 100} fill="none" stroke="var(--hairline)" strokeWidth="1" />
          ))}
          <line x1="-120" x2="120" y1="0" y2="0" stroke="var(--hairline)" />
          <line y1="-120" y2="120" x1="0" x2="0" stroke="var(--hairline)" />
          {WORDS.map((w) => (
            <g key={w.word}>
              <line x1="0" y1="0" x2={w.x * 100} y2={-w.y * 100} stroke={w.color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <circle cx={w.x * 100} cy={-w.y * 100} r="3.5" fill={w.color} />
              <text
                x={w.x * 100 + (w.x > 0 ? 6 : -6)}
                y={-w.y * 100 - 6}
                textAnchor={w.x > 0 ? "start" : "end"}
                className="fill-fg text-[9px] font-semibold"
              >
                {w.word}
              </text>
            </g>
          ))}
          <motion.line x1={0} y1={0} x2={lineX} y2={lineY} stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" />
          <motion.g
            id="vector-handle"
            style={{ x: lineX, y: lineY }}
            onPointerDown={onPointerDown}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle r="16" fill="transparent" />
            <circle r="7" fill="var(--fg)" stroke="var(--surface)" strokeWidth="2.5" />
          </motion.g>
        </svg>
        <span className="absolute top-4 left-5 rounded-full bg-[var(--hairline)] px-2.5 py-1 text-[0.75rem] font-semibold text-fg-2">
          Illustrative coordinates
        </span>
      </div>

      <div>
        <h3 className="display text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)]">Cosine similarity, live</h3>
        <p className="mt-3 text-fg-2">
          Drag the black point. Each bar shows the cosine of the angle between your vector and a word
          vector: 1 means the same direction, 0 unrelated, −1 opposite. Length does not matter, only
          direction. These 2-D points are hand-placed for illustration; real embeddings have hundreds
          of dimensions.
        </p>
        <div
          role="group"
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Your vector. Use the arrow keys to move it."
          className="mt-6 rounded-[var(--radius-md)]"
        >
          <ul className="space-y-2.5">
            {WORDS.map((w) => (
              <Row key={w.word} {...w} hx={hx} hy={hy} />
            ))}
          </ul>
        </div>
        <p className="mt-4 text-[0.875rem] text-fg-3" aria-live="polite">
          Closest direction: <strong className="font-semibold text-fg">{nearest}</strong>
        </p>
      </div>
    </div>
  );
}

function Row({ word, x, y, color, hx, hy }: (typeof WORDS)[number] & { hx: MotionValue<number>; hy: MotionValue<number> }) {
  const cos = useTransform(() => cosine(hx.get(), hy.get(), x, y));
  const label = useTransform(cos, (c) => c.toFixed(2).replace("-", "−"));
  // Bar grows from the centre: right for positive, left for negative. Transform only.
  const scaleX = useTransform(cos, (c) => Math.abs(c));
  const originX = useTransform(cos, (c) => (c >= 0 ? 0 : 1));
  const left = useTransform(cos, (c) => (c >= 0 ? "50%" : "0%"));
  return (
    <li className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-[0.9375rem]">
      <span className="font-medium">{word}</span>
      <span className="relative h-2 overflow-hidden rounded-full bg-[var(--hairline)]">
        <span className="absolute inset-y-0 left-1/2 w-px bg-[var(--fg-3)]" aria-hidden />
        <motion.span
          className="absolute inset-y-0 w-1/2 rounded-full"
          style={{ left, scaleX, originX, backgroundColor: color }}
        />
      </span>
      <motion.span className="text-end text-fg-2 tabular-nums">{label}</motion.span>
    </li>
  );
}
