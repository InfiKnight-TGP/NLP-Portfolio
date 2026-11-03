"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useStill } from "@/lib/motionPrefs";
import { project, SETTLE_REDUCED, SPRING, SPRING_FLICK } from "@/lib/physics";
import { useDrag } from "@/lib/useDrag";

export type Photo = { src: StaticImageData; alt: string; caption: string };

/**
 * Lightbox that grows out of the thumbnail that opened it and closes back into the current one.
 * Drag down to dismiss (velocity carries into the close); grab it mid-flight and it follows.
 * Arrow keys switch photos; focus stays inside until it closes, then returns to the thumbnail.
 */
export function PhotoSheet({
  photos,
  index,
  onIndex,
  origin,
  onClosed,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  origin: (i: number) => HTMLElement | null | undefined;
  onClosed: () => void;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const still = useStill();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0);
  const scrim = useMotionValue(0);
  const closing = useRef(false);
  const current = useRef(index);
  useLayoutEffect(() => {
    current.current = index;
  });

  function setInert(on: boolean) {
    for (const el of document.body.children) {
      if (!el.contains(sheet.current)) (el as HTMLElement).inert = on;
    }
  }

  // Offset + scale that lay the sheet exactly over a thumbnail (measured at rest).
  function fromThumb(i: number) {
    const s = sheet.current?.getBoundingClientRect();
    const o = origin(i)?.getBoundingClientRect();
    if (!s || !o) return { x: 0, y: 0, scale: 0.9 };
    const w = s.width / scale.get();
    const cx = s.left + s.width / 2 - x.get();
    const cy = s.top + s.height / 2 - y.get();
    return { x: o.left + o.width / 2 - cx, y: o.top + o.height / 2 - cy, scale: Math.max(0.08, o.width / w) };
  }

  function to(t: { x: number; y: number; scale: number; opacity: number; scrim: number }, vy = 0) {
    if (still) {
      x.set(0);
      y.set(0);
      scale.set(1);
      animate(scrim, t.scrim, SETTLE_REDUCED);
      return animate(opacity, t.opacity, SETTLE_REDUCED);
    }
    const spring = vy ? SPRING_FLICK : SPRING;
    animate(x, t.x, spring);
    animate(y, t.y, { ...spring, velocity: vy });
    animate(scale, t.scale, SPRING);
    animate(scrim, t.scrim, { duration: 0.3, ease: "easeOut" });
    return animate(opacity, t.opacity, { duration: t.opacity ? 0.15 : 0.3, ease: "easeOut" });
  }

  function close(vy = 0) {
    closing.current = true;
    to({ ...fromThumb(current.current), opacity: 0, scrim: 0 }, vy).then(() => {
      if (!closing.current) return;
      setInert(false); // before onClosed, so focus can return to the thumbnail
      onClosed();
    });
  }

  useLayoutEffect(() => {
    if (!still) {
      const f = fromThumb(index);
      x.set(f.x);
      y.set(f.y);
      scale.set(f.scale);
    }
    closing.current = false;
    to({ x: 0, y: 0, scale: 1, opacity: 1, scrim: 1 });
    closeBtn.current?.focus({ preventScroll: true });
    setInert(true);
    return () => setInert(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const go = (d: number) => onIndex((current.current + d + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        return go(e.key === "ArrowRight" ? 1 : -1);
      }
      if (e.key !== "Tab") return;
      // Keep focus inside the sheet.
      const items = [...(sheet.current?.querySelectorAll<HTMLElement>("button") ?? [])];
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const drag = useDrag({
    y: { mv: y, min: () => 0, max: () => Infinity, size: () => sheet.current?.offsetHeight ?? 500 },
    threshold: 4,
    onStart: () => {
      // Caught mid-flight: cancel any close and settle the other channels from where they are.
      closing.current = false;
      animate(x, 0, SPRING);
      animate(scale, 1, SPRING);
      animate(opacity, 1, { duration: 0.15 });
      animate(scrim, 1, { duration: 0.15 });
    },
    onRelease: ({ y: vy }) => {
      const h = sheet.current?.offsetHeight ?? 500;
      if (y.get() + project(vy) > h * 0.4 || vy > 900) close(vy);
      else if (y.get() !== 0) animate(y, 0, { ...SPRING_FLICK, velocity: vy });
    },
  });

  const photo = photos[index];
  const btn = "press rounded-full bg-white/12 px-3.5 py-1.5 text-[0.875rem] font-semibold text-white focus-visible:outline-white";

  return createPortal(
    <div className="fixed inset-0 z-50">
      <motion.div
        style={{ opacity: scrim }}
        onClick={() => close()}
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px] still:backdrop-blur-none"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center p-3 sm:p-6">
        <motion.div
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-label={`${photo.caption}, photo ${index + 1} of ${photos.length}`}
          style={{ x, y, scale, opacity }}
          onPointerDown={drag.onPointerDown}
          onClickCapture={drag.onClickCapture}
          className="pointer-events-auto w-[min(64rem,94vw,calc(76svh*1.2))] touch-none overflow-hidden rounded-[var(--radius-lg)] bg-[#0d0e11] shadow-[var(--shadow-lg)] select-none"
        >
          <div className="relative aspect-[864/720] w-full">
            <AnimatePresence initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image src={photo.src} alt={photo.alt} sizes="(min-width: 1100px) 64rem, 94vw" placeholder="blur" draggable={false} className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-[0.875rem]">
              <span className="font-semibold">{photo.caption}</span>{" "}
              <span className="text-white/70">
                {index + 1} of {photos.length}
              </span>
            </p>
            <div className="flex gap-2">
              <button type="button" className={btn} onClick={() => go(-1)} aria-label="Previous photo">
                ←
              </button>
              <button type="button" className={btn} onClick={() => go(1)} aria-label="Next photo">
                →
              </button>
              <button ref={closeBtn} type="button" className={btn} onClick={() => close()}>
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
