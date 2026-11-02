"use client";

import { useEffect, useRef } from "react";

/** Absolute time (ms since navigation start) the dots should have landed: matches the CSS name reveal. */
const LAND = 1500;
/** Skip the intro if the code arrives too late to land in time. */
const LATEST_START = 900;

type Dot = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; delay: number; accent: boolean };

/**
 * One-time intro: a field of "token" dots drifts in and springs onto the pixels of the name.
 * The real <h1> fades in underneath as the dots land, then the canvas fades and stops.
 * Canvas only; capped at DPR 2; fewer dots on coarse pointers.
 */
export function HeroIntro({ titleId }: { titleId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const start = performance.now();
    const cv = canvas.current;
    const title = document.getElementById(titleId);
    if (!cv || !title || start > LATEST_START || document.documentElement.dataset.motion === "still") return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = cv.getBoundingClientRect(); // the canvas covers the whole hero grid
    cv.width = Math.round(box.width * dpr);
    cv.height = Math.round(box.height * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // Draw each word where the real word sits (outer spans are not transformed by the CSS reveal).
    const cs = getComputedStyle(title);
    const size = parseFloat(cs.fontSize);
    const off = document.createElement("canvas");
    off.width = cv.width;
    off.height = cv.height;
    const o = off.getContext("2d", { willReadFrequently: true })!;
    o.scale(dpr, dpr);
    o.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    o.letterSpacing = `${-0.02 * size}px`;
    o.textBaseline = "alphabetic";
    const m = o.measureText("Hg");
    const lineH = parseFloat(cs.lineHeight) || size * 1.05;
    const half = (lineH - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
    for (const span of title.querySelectorAll<HTMLElement>("[data-word]")) {
      const r = span.getBoundingClientRect();
      o.fillText(span.dataset.word!, r.left - box.left, r.top - box.top + half + m.fontBoundingBoxAscent);
    }

    const coarse = matchMedia("(pointer: coarse)").matches;
    const max = coarse ? 450 : 1000;
    const step = Math.max(2, Math.round((size / 26) * dpr));
    const px = o.getImageData(0, 0, off.width, off.height).data;
    const targets: [number, number][] = [];
    for (let y = 0; y < off.height; y += step)
      for (let x = 0; x < off.width; x += step) if (px[(y * off.width + x) * 4 + 3] > 128) targets.push([x / dpr, y / dpr]);
    // Even subsample down to the budget.
    const keep = targets.length > max ? targets.filter((_, i) => i % Math.ceil(targets.length / max) === 0) : targets;

    const W = box.width;
    const H = box.height;
    const dots: Dot[] = keep.map(([tx, ty]) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      tx,
      ty,
      delay: 300 + (tx / W) * 450 + Math.random() * 120, // sweep left to right
      accent: Math.random() < 0.12,
    }));

    const fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#1d1d1f";
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0066cc";
    const w = (2 * Math.PI) / 0.45; // spring response 0.45 s, critically damped
    const dot = 1.6;
    let raf = 0;
    let last = start;

    const frame = (now: number) => {
      // Paused or reduced mid-intro: hand over to the static text immediately.
      if (document.documentElement.dataset.motion === "still") return finish();
      const t = now - start;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const appear = Math.min(1, t / 400);
      const landed = performance.now() > LAND + 250;
      for (const d of dots) {
        if (t > d.delay) {
          d.vx += (-w * w * (d.x - d.tx) - 2 * w * d.vx) * dt;
          d.vy += (-w * w * (d.y - d.ty) - 2 * w * d.vy) * dt;
        }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        ctx.globalAlpha = appear * (d.accent ? 0.9 : 0.75);
        ctx.fillStyle = d.accent ? accent : fg;
        ctx.fillRect(d.x - dot / 2, d.y - dot / 2, dot, dot);
      }
      if (landed) return finish();
      raf = requestAnimationFrame(frame);
    };

    function finish() {
      cancelAnimationFrame(raf);
      cv!.style.opacity = "0"; // CSS transition fades the dots out as the real text arrives
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [titleId]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
    />
  );
}
