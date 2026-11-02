"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";

type Prefs = {
  /** The visitor pressed "Pause motion". */
  paused: boolean;
  setPaused: (p: boolean) => void;
  /** The system asks for reduced motion. */
  reduced: boolean;
  /** Either of the above: show final-state compositions, cross-fade only, no loops. */
  still: boolean;
};

const Ctx = createContext<Prefs>({ paused: false, setPaused: () => {}, reduced: false, still: false });

export function MotionPrefsProvider({ children }: { children: React.ReactNode }) {
  // Read after hydration so server and first client render agree.
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const still = paused || reduced;

  // CSS reads this too (the `still:` variant, ambient loops). Only ever present when still:
  // writing it at load would restyle and re-lay out the whole page during hydration.
  useEffect(() => {
    const root = document.documentElement;
    if (still) root.dataset.motion = "still";
    else delete root.dataset.motion;
  }, [still]);

  return (
    <Ctx.Provider value={{ paused, setPaused, reduced, still }}>
      <MotionConfig reducedMotion={still ? "always" : "never"}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}

export const useMotionPrefs = () => useContext(Ctx);
/** True when motion should be replaced by final states and cross-fades. */
export const useStill = () => useContext(Ctx).still;

/**
 * True while an ambient effect should run: element on (or near) screen, tab visible,
 * and motion not paused or reduced. Ambient loops must stop when this is false.
 */
export function useAmbientActive(ref: React.RefObject<Element | null>, margin = "0px") {
  const still = useStill();
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, margin]);

  return inView && visible && !still;
}

// Scenes wait for the first sign of a visitor (scroll, pointer, key, touch), so a page that is only
// loaded never pays for them; after that, they mount in idle time as they approach.
let interacted = false;
const waiting = new Set<() => void>();
function onFirstInput(cb: () => void) {
  if (interacted) return cb();
  if (!waiting.size) {
    const go = () => {
      interacted = true;
      for (const e of ["scroll", "pointerdown", "keydown", "touchstart", "wheel"]) window.removeEventListener(e, go);
      waiting.forEach((f) => f());
      waiting.clear();
    };
    for (const e of ["scroll", "pointerdown", "keydown", "touchstart", "wheel"]) window.addEventListener(e, go, { passive: true, once: true });
  }
  waiting.add(cb);
}

/** Becomes true (once) when the element comes within `margin` of the viewport, after first input: used to lazy-mount scenes. */
export function useNear(ref: React.RefObject<Element | null>, margin = "0px 0px 25% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    let idle = 0;
    // Mount in idle time so a scene never competes with input or the first paint.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 150));
    let stopped = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !idle)
          onFirstInput(() => {
            if (!stopped && !idle) idle = ric(() => setNear(true), { timeout: 600 });
          });
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => {
      stopped = true;
      io.disconnect();
      if (idle) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, [ref, margin, near]);
  return near;
}
