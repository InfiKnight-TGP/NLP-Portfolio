"use client";

import { useStill } from "@/lib/motionPrefs";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue } from "motion/react";
import { project, SETTLE_REDUCED, SPRING, SPRING_FLICK } from "@/lib/physics";
import { useDrag } from "@/lib/useDrag";
import { StarCount } from "./StarIcon";

type Moment = { count: number; title: string; detail?: string };

/**
 * A sheet that grows out of the star that opened it and shrinks back into it.
 * Drag it down to dismiss; grab it mid-animation and it follows the finger from where it is.
 */
export function StarSheet({
  moment,
  origin,
  onClosed,
}: {
  moment: Moment;
  origin: () => HTMLElement | null | undefined;
  onClosed: () => void;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const reduced = useStill();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0);
  const scrim = useMotionValue(0);
  const closing = useRef(false);

  // Everything behind the dialog is inert while it is open.
  function setInert(on: boolean) {
    for (const el of document.body.children) {
      if (!el.contains(sheet.current)) (el as HTMLElement).inert = on;
    }
  }

  // Offset + scale that place the sheet exactly over its star.
  function fromStar() {
    const s = sheet.current?.getBoundingClientRect();
    const o = origin()?.getBoundingClientRect();
    if (!s || !o) return { x: 0, y: 0, scale: 0.9 };
    // Measure the sheet at rest: undo the live transform.
    const w = s.width / scale.get();
    const h = s.height / scale.get();
    const cx = s.left + s.width / 2 - x.get();
    const cy = s.top + s.height / 2 - y.get();
    return {
      x: o.left + o.width / 2 - cx,
      y: o.top + o.height / 2 - cy,
      scale: Math.max(0.08, Math.min(o.width / w, o.height / h)),
    };
  }

  function to(target: { x: number; y: number; scale: number; opacity: number; scrim: number }, vy = 0) {
    if (reduced) {
      x.set(0);
      y.set(0);
      scale.set(1);
      animate(scrim, target.scrim, SETTLE_REDUCED);
      return animate(opacity, target.opacity, SETTLE_REDUCED);
    }
    const spring = vy ? SPRING_FLICK : SPRING;
    animate(x, target.x, spring);
    animate(y, target.y, { ...spring, velocity: vy });
    animate(scale, target.scale, SPRING);
    animate(scrim, target.scrim, { duration: 0.3, ease: "easeOut" });
    // Resolves once the sheet is invisible, so focus returns without waiting out the spring's tail.
    return animate(opacity, target.opacity, { duration: target.opacity ? 0.15 : 0.3, ease: "easeOut" });
  }

  function open() {
    closing.current = false;
    to({ x: 0, y: 0, scale: 1, opacity: 1, scrim: 1 });
  }

  function close(vy = 0) {
    closing.current = true;
    const f = fromStar();
    to({ ...f, opacity: 0, scrim: 0 }, vy).then(() => {
      if (!closing.current) return;
      setInert(false); // before onClosed, so focus can return to the star
      onClosed();
    });
  }

  useLayoutEffect(() => {
    if (!reduced) {
      const f = fromStar();
      x.set(f.x);
      y.set(f.y);
      scale.set(f.scale);
    }
    open();
    closeBtn.current?.focus({ preventScroll: true });
    setInert(true);
    return () => setInert(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Done is the dialog's only control, so Tab stays on it rather than leaving the page.
      if (e.key === "Tab") {
        e.preventDefault();
        closeBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const drag = useDrag({
    y: {
      mv: y,
      min: () => 0,
      max: () => Infinity,
      size: () => sheet.current?.offsetHeight ?? 400,
    },
    threshold: 4,
    onStart: () => {
      // Caught mid-flight: cancel any close and settle the other channels from where they are.
      closing.current = false;
      x.stop();
      animate(x, 0, SPRING);
      animate(scale, 1, SPRING);
      animate(opacity, 1, { duration: 0.15 });
      animate(scrim, 1, { duration: 0.15 });
    },
    onRelease: ({ y: vy }) => {
      const h = sheet.current?.offsetHeight ?? 400;
      const projected = y.get() + project(vy);
      if (projected > h * 0.45 || vy > 900) close(vy);
      else if (y.get() !== 0) animate(y, 0, { ...SPRING_FLICK, velocity: vy });
    },
  });

  return createPortal(
    <div className="fixed inset-0 z-50">
      <motion.div
        style={{ opacity: scrim }}
        onClick={() => close()}
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[6px] still:backdrop-blur-none"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <motion.div
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-labelledby="star-sheet-title"
          style={{ x, y, scale, opacity }}
          onPointerDown={drag.onPointerDown}
          onClickCapture={drag.onClickCapture}
          className="pointer-events-auto w-full max-w-[28rem] touch-none rounded-t-[var(--radius-lg)] bg-surface px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)] select-none sm:rounded-[var(--radius-lg)] sm:pb-6"
        >
          <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-[var(--hairline)]" />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <StarCount count={moment.count} className="h-6 w-6" />
              <p className="mt-1 text-[0.875rem] font-medium text-fg-3">
                {moment.count} {moment.count === 1 ? "star" : "stars"}
              </p>
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => close()}
              className="press rounded-full bg-[var(--hairline)] px-4 py-1.5 text-[0.9375rem] font-semibold text-accent"
            >
              Done
            </button>
          </div>
          <h3 id="star-sheet-title" className="display mt-4 text-[1.75rem]">
            {moment.title}
          </h3>
          {moment.detail && <p className="lead mt-2">{moment.detail}</p>}
          <p className="mt-6 text-[0.8125rem] text-fg-3">Drag down or press Escape to close.</p>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
