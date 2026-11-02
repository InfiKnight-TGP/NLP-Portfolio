import { animate, type MotionValue } from "motion/react";

/** Damping 1.0, response ~0.4 s: the default for anything a person touches. */
export const SPRING_OPTS = { bounce: 0, visualDuration: 0.4 };
export const SPRING = { type: "spring", ...SPRING_OPTS } as const;
/** Damping ~0.8: only after a flick or a drag release carried momentum. */
export const SPRING_FLICK = { type: "spring", bounce: 0.2, visualDuration: 0.4 } as const;
/** Reduced motion: a short, non-elastic settle instead of a spring. */
export const SETTLE_REDUCED = { type: "tween", duration: 0.2, ease: "easeOut" } as const;

/** Apple's momentum projection (Designing Fluid Interfaces): where a flick comes to rest. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past an edge: the further you pull, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Applies rubber-banding to a raw position outside [min, max]. */
export function band(raw: number, min: number, max: number, dimension: number) {
  if (raw < min) return min - rubberband(min - raw, dimension);
  if (raw > max) return max + rubberband(raw - max, dimension);
  return raw;
}

/**
 * Springs a value to `target`, starting from its live value and carrying `velocity`.
 * Under reduced motion it settles with a short tween and no overshoot.
 */
export function settle(
  mv: MotionValue<number>,
  target: number,
  { velocity = 0, flick = false, reduced = false } = {},
) {
  if (reduced) return animate(mv, target, SETTLE_REDUCED);
  return animate(mv, target, { ...(flick ? SPRING_FLICK : SPRING), velocity });
}
