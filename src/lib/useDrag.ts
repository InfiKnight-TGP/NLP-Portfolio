"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { band } from "./physics";

export type DragAxis = {
  mv: MotionValue<number>;
  min: () => number;
  max: () => number;
  /** Dimension used to scale rubber-band resistance (usually the viewport of the draggable). */
  size: () => number;
};

type Options = {
  x?: DragAxis;
  y?: DragAxis;
  /** Movement (px) before a press becomes a drag; below it, the press is a tap. */
  threshold?: number;
  onStart?: () => void;
  /** Always called when the pointer lifts, with live velocity in px/s (0 for a tap). */
  onRelease?: (velocity: { x: number; y: number }) => void;
  onTap?: () => void;
};

/**
 * 1:1 pointer tracking with capture, rubber-banding past bounds, and velocity at release.
 * Position is origin + pointer delta, so the grab offset is preserved. A press stops any
 * running animation and continues from the live value, so motion can be caught mid-flight.
 */
export function useDrag(options: Options) {
  const opts = useRef(options);
  useLayoutEffect(() => {
    opts.current = options;
  });
  const dragged = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !e.isPrimary) return;
    const o = opts.current;
    const el = e.currentTarget;
    const id = e.pointerId;
    o.x?.mv.stop();
    o.y?.mv.stop();
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = o.x?.mv.get() ?? 0;
    const oy = o.y?.mv.get() ?? 0;
    const threshold = o.threshold ?? 8;
    dragged.current = false;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!dragged.current) {
        if (Math.hypot(dx, dy) < threshold) return;
        dragged.current = true;
        el.setPointerCapture(id);
        o.onStart?.();
      }
      const { x, y } = opts.current;
      if (x) x.mv.set(band(ox + dx, x.min(), x.max(), x.size()));
      if (y) y.mv.set(band(oy + dy, y.min(), y.max(), y.size()));
    };

    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      const cur = opts.current;
      if (!dragged.current && ev.type === "pointerup") cur.onTap?.();
      cur.onRelease?.({
        x: dragged.current ? (cur.x?.mv.getVelocity() ?? 0) : 0,
        y: dragged.current ? (cur.y?.mv.getVelocity() ?? 0) : 0,
      });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }, []);

  /** Swallows the click that follows a drag so buttons inside the area don't fire. */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragged.current) {
      e.stopPropagation();
      e.preventDefault();
      dragged.current = false;
    }
  }, []);

  return { onPointerDown, onClickCapture };
}
