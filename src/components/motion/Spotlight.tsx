"use client";

import { useEffect } from "react";

/**
 * One delegated pointer listener positions a soft light under the mouse on any `.spot` card.
 * It writes CSS variables straight onto the card (the glow moves with transform), so React never re-renders.
 */
export function Spotlight() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let card: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const next = (e.target as Element | null)?.closest?.<HTMLElement>(".spot") ?? null;
      card = next;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--sx", `${e.clientX - r.left}px`);
      card.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
