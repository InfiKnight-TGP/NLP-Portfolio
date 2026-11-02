"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { band, clamp, project, SETTLE_REDUCED, SPRING, SPRING_FLICK } from "@/lib/physics";
import { stars } from "@/lib/content";

const MIN = 1;
const MAX = 4;

/**
 * The notebook photo as a card you can pan, pinch, ctrl/⌘-scroll or double-tap to zoom.
 * Panning past the edges rubber-bands; releasing carries momentum into a spring.
 */
export function ZoomCard() {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = useMotionValue(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ s0: number; x0: number; y0: number; px: number; py: number; d0: number }>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const moved = useRef(0);

  // At 1x, vertical swipes still scroll the page; once zoomed, every touch pans the photo.
  useMotionValueEvent(s, "change", (v) => {
    if (box.current) box.current.style.touchAction = v > 1.01 ? "none" : "pan-y";
  });

  const dims = () => {
    const r = box.current!.getBoundingClientRect();
    return { r, w: r.width, h: r.height };
  };
  const limit = (scale: number) => {
    const { w, h } = dims();
    return { bx: ((scale - 1) * w) / 2, by: ((scale - 1) * h) / 2 };
  };
  /** Point relative to the box centre. */
  const focal = (cx: number, cy: number) => {
    const { r } = dims();
    return { fx: cx - r.left - r.width / 2, fy: cy - r.top - r.height / 2 };
  };

  function go(target: { x: number; y: number; s: number }, v = { x: 0, y: 0 }) {
    const flick = v.x !== 0 || v.y !== 0;
    const t = reduced ? SETTLE_REDUCED : flick ? SPRING_FLICK : SPRING;
    animate(s, target.s, reduced ? SETTLE_REDUCED : SPRING);
    animate(x, target.x, reduced ? t : { ...t, velocity: v.x });
    animate(y, target.y, reduced ? t : { ...t, velocity: v.y });
  }

  /** Zoom to `next` keeping the content under (fx, fy) in place, then clamp to the edges. */
  function zoomAt(next: number, fx: number, fy: number) {
    const sc = clamp(next, MIN, MAX);
    const k = sc / s.get();
    const { bx, by } = limit(sc);
    return { s: sc, x: clamp(fx - (fx - x.get()) * k, -bx, bx), y: clamp(fy - (fy - y.get()) * k, -by, by) };
  }

  function begin() {
    const pts = [...pointers.current.values()];
    const px = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const py = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const d0 = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { s0: s.get(), x0: x.get(), y0: y.get(), px, py, d0 };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    x.stop();
    y.stop();
    s.stop();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) moved.current = 0;
    begin();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    const px = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const py = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    moved.current = Math.max(moved.current, Math.hypot(px - g.px, py - g.py));
    let sc = g.s0;
    if (pts.length > 1 && g.d0 > 0) {
      const raw = (g.s0 * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)) / g.d0;
      sc = band(raw, MIN, MAX, 2); // soft resistance past the zoom limits
      moved.current = Infinity;
    }
    // Content under the gesture's starting midpoint follows the current midpoint.
    const a = focal(g.px, g.py);
    const k = sc / g.s0;
    const rawX = a.fx - (a.fx - g.x0) * k + (px - g.px);
    const rawY = a.fy - (a.fy - g.y0) * k + (py - g.py);
    const { bx, by } = limit(sc);
    const { w, h } = dims();
    s.set(sc);
    x.set(band(rawX, -bx, bx, w));
    y.set(band(rawY, -by, by, h));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pointers.current.delete(e.pointerId)) return;
    if (pointers.current.size > 0) return begin(); // a finger lifted mid-pinch: keep going
    gesture.current = null;

    if (moved.current < 8 && e.type === "pointerup") {
      const now = performance.now();
      const lt = lastTap.current;
      if (now - lt.t < 300 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
        lastTap.current.t = 0;
        const { fx, fy } = focal(e.clientX, e.clientY);
        return go(s.get() > 1.05 ? { s: 1, x: 0, y: 0 } : zoomAt(2.5, fx, fy));
      }
      lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    }

    const sc = clamp(s.get(), MIN, MAX);
    const { bx, by } = limit(sc);
    const vx = x.getVelocity();
    const vy = y.getVelocity();
    const p = reduced ? 0 : 1;
    go(
      { s: sc, x: clamp(x.get() + p * project(vx), -bx, bx), y: clamp(y.get() + p * project(vy), -by, by) },
      { x: vx, y: vy },
    );
  }

  // Trackpad pinch and ctrl/⌘ + wheel zoom at the cursor. Needs a non-passive listener.
  useEffect(() => {
    const el = box.current!;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      x.stop();
      y.stop();
      s.stop();
      const { fx, fy } = focal(e.clientX, e.clientY);
      const t = zoomAt(s.get() * Math.exp(-e.deltaY * 0.01), fx, fy);
      s.set(t.s);
      x.set(t.x);
      y.set(t.y);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  function zoomBy(f: number) {
    go(f === 0 ? { s: 1, x: 0, y: 0 } : zoomAt(s.get() * f, 0, 0));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const pan = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] }[e.key];
    if (e.key === "+" || e.key === "=") zoomBy(1.5);
    else if (e.key === "-") zoomBy(1 / 1.5);
    else if (e.key === "0") zoomBy(0);
    else if (pan && s.get() > 1.01) {
      const { bx, by } = limit(s.get());
      go({ s: s.get(), x: clamp(x.get() + pan[0], -bx, bx), y: clamp(y.get() + pan[1], -by, by) });
    } else return;
    e.preventDefault();
  }

  const btn =
    "press grid h-9 w-9 place-items-center rounded-full bg-[var(--hairline)] text-[1.125rem] font-semibold text-fg";

  return (
    <figure className="w-full max-w-[22rem]">
      <div
        ref={box}
        tabIndex={0}
        role="img"
        aria-label={`${stars.photoAlt} Zoomable: press plus or minus to zoom, arrow keys to pan, 0 to reset.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="card relative aspect-[587/1024] cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
      >
        <motion.div style={{ x, y, scale: s }} className="h-full w-full">
          <Image
            src="/stars-index.jpg"
            alt=""
            width={587}
            height={1024}
            sizes="22rem"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
        </motion.div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[0.875rem] text-fg-3">Pinch, double-tap or ⌘/Ctrl-scroll to zoom.</span>
        <span className="flex shrink-0 gap-1.5">
          <button type="button" className={btn} onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out">
            −
          </button>
          <button type="button" className={btn} onClick={() => zoomBy(1.5)} aria-label="Zoom in">
            +
          </button>
          <button type="button" className={`${btn} w-auto px-3 text-[0.8125rem]`} onClick={() => zoomBy(0)}>
            Reset
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
