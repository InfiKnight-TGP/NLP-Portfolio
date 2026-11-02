"use client";

import { useEffect, useRef } from "react";
import { useAmbientActive, useNear } from "@/lib/motionPrefs";

// Terms from the course, as named in the portfolio.
const TERMS = [
  "tokenisation", "stop-word removal", "stemming", "lemmatisation", "POS tagging", "named entities",
  "bag of words", "TF-IDF", "n-gram", "Viterbi", "minimum edit distance", "COCA", "Brown Corpus",
  "Word2Vec", "GloVe", "FastText", "BERT", "Sentence-BERT", "cosine similarity", "MuRIL", "IndicBERT",
  "IndicSBERT", "transliteration", "Unicode normalisation", "McNemar's test",
];
const ROW = TERMS.join("  ·  ") + "  ·  ";

/**
 * A slow (90 s per lap), faint marquee of course terms. Drawn once to two canvas strips and slid
 * with a CSS transform; it runs only on screen, in a visible tab, when motion isn't still.
 * Canvas keeps this purely decorative ribbon out of the text layer (it's aria-hidden anyway).
 */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const strips = useRef<(HTMLCanvasElement | null)[]>([]);
  const active = useAmbientActive(ref);
  // Rasterising the strips is the costly part: do it only as the ribbon approaches, in idle time.
  const near = useNear(ref, "0px 0px 50% 0px");

  useEffect(() => {
    if (!near) return;
    const draw = () => {
      const wrap = ref.current;
      if (!wrap) return;
      const cs = getComputedStyle(wrap);
      const size = parseFloat(cs.fontSize);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const font = `700 ${size}px ${cs.fontFamily}`;
      const color = getComputedStyle(document.documentElement).getPropertyValue("--fg-3").trim();
      for (const cv of strips.current) {
        if (!cv) continue;
        const ctx = cv.getContext("2d")!;
        ctx.font = font;
        ctx.letterSpacing = `${-0.02 * size}px`;
        const w = Math.ceil(ctx.measureText(ROW).width);
        const h = Math.ceil(size * 1.4);
        cv.width = w * dpr;
        cv.height = h * dpr;
        cv.style.width = `${w}px`;
        ctx.scale(dpr, dpr);
        ctx.font = font;
        ctx.letterSpacing = `${-0.02 * size}px`;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4; // faint by design: an ambient ribbon, not content
        ctx.textBaseline = "middle";
        ctx.fillText(ROW, 0, h / 2);
      }
    };
    draw();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", draw);
    window.addEventListener("resize", draw);
    return () => {
      mq.removeEventListener("change", draw);
      window.removeEventListener("resize", draw);
    };
  }, [near]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-active={active}
      className="marquee overflow-hidden py-10 font-sans text-[clamp(2rem,1.5rem+3vw,3.5rem)] select-none"
    >
      <div className="marquee-track flex h-[1.4em] w-max">
        {[0, 1].map((k) => (
          <canvas key={k} ref={(el) => void (strips.current[k] = el)} className="h-full shrink-0" />
        ))}
      </div>
    </div>
  );
}
