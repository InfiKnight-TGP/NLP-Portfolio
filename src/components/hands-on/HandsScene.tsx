"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import data from "@/data/nltk-pipeline.json";

const { tokens, entities, bow, tfidf } = data.scene;
const ENT = new Map(entities.map(([e, label]) => [e, label]));
const MAX_TFIDF = Math.max(...tfidf.map(([, v]) => Number(v)));
const MAX_COUNT = Math.max(...bow.map(([, v]) => Number(v)));

// Phase windows on the 0..1 progress (match handsSceneData captions).
const SPLIT = [0.04, 0.12];
const DROP = [0.15, 0.25];
const STEM = [0.29, 0.37];
const LEMMA = [0.43, 0.5];
const POS = [0.55, 0.63];
const NER = [0.67, 0.72];
const COLLAPSE = [0.76, 0.84];
const REWEIGHT = [0.89, 0.97];

function Token({ p, tok, i }: { p: MotionValue<number>; tok: (typeof tokens)[number]; i: number }) {
  const border = useTransform(p, SPLIT, [0, 1]);
  const gone = tok.removed !== null;
  const dropOpacity = useTransform(p, DROP, [1, gone ? 0.18 : 1]);
  const dropY = useTransform(p, DROP, [0, gone ? 10 : 0]);
  // Word -> stem -> lemma, stacked in one grid cell so the chip's width never changes (no layout shift).
  const word = useTransform(p, [STEM[0], STEM[1]], [1, gone ? 1 : 0]);
  const stem = useTransform(p, [STEM[0], STEM[1], LEMMA[0], LEMMA[1]], gone ? [0, 0, 0, 0] : [0, 1, 1, 0]);
  const lemma = useTransform(p, [LEMMA[0], LEMMA[1]], [0, gone ? 0 : 1]);
  const tagO = useTransform(p, [POS[0] + (i / tokens.length) * 0.05, POS[1]], [0, gone ? 0.35 : 1]);
  const tagY = useTransform(p, POS, [-4, 0]);
  const ent = ENT.get(tok.t);
  const entO = useTransform(p, NER, [0, ent ? 1 : 0]);
  // Collapse toward the chart below.
  const c0 = COLLAPSE[0] + (i / tokens.length) * 0.04;
  const collapseO = useTransform(p, [c0, c0 + 0.04], [1, 0]);
  const collapseY = useTransform(p, [c0, c0 + 0.04], [0, 40]);
  const collapseS = useTransform(p, [c0, c0 + 0.04], [1, 0.6]);
  const changed = tok.stem !== tok.t;

  return (
    <motion.li style={{ opacity: collapseO, y: collapseY, scale: collapseS }} className="still:opacity-100! still:transform-none!">
      <motion.div style={{ opacity: dropOpacity, y: dropY }} className="flex flex-col items-center">
        <span className="relative rounded-md px-1.5 py-1 font-mono text-[0.8125rem] leading-none text-fg sm:text-[0.9375rem]">
          <motion.span aria-hidden style={{ opacity: border }} className="absolute inset-0 rounded-md bg-[var(--hairline)]" />
          <motion.span aria-hidden style={{ opacity: entO }} className="absolute -inset-0.5 rounded-md ring-2 ring-[#bf5af2]" />
          <span className="relative grid [&>*]:col-start-1 [&>*]:row-start-1">
            <motion.span style={{ opacity: word }}>{tok.t}</motion.span>
            <motion.span style={{ opacity: stem }} className={changed ? "text-accent" : undefined}>
              {tok.stem}
            </motion.span>
            <motion.span style={{ opacity: lemma }} className={tok.lemma !== tok.t ? "text-accent" : undefined}>
              {tok.lemma}
            </motion.span>
          </span>
        </span>
        <motion.span style={{ opacity: tagO, y: tagY }} className="mt-1 text-[0.625rem] font-semibold tracking-wide text-fg-3">
          {tok.pos}
        </motion.span>
        {ent && (
          <motion.span style={{ opacity: entO }} className="mt-0.5 text-[0.5625rem] font-bold text-[#a33fd0] dark:text-[#d08cf0]">
            {ent}
          </motion.span>
        )}
      </motion.div>
    </motion.li>
  );
}

function Bar({ p, term, count, score, i }: { p: MotionValue<number>; term: string; count: number; score: number; i: number }) {
  const grow0 = COLLAPSE[0] + 0.03 + i * 0.006;
  const scaleX = useTransform(p, [grow0, grow0 + 0.05, REWEIGHT[0], REWEIGHT[1]], [0, count / MAX_COUNT, count / MAX_COUNT, score / MAX_TFIDF]);
  const countO = useTransform(p, [grow0 + 0.03, grow0 + 0.05, REWEIGHT[0], REWEIGHT[0] + 0.03], [0, 1, 1, 0]);
  const scoreO = useTransform(p, [REWEIGHT[0] + 0.03, REWEIGHT[1]], [0, 1]);
  const shared = score < MAX_TFIDF;
  return (
    <li className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-[0.75rem] sm:text-[0.8125rem]">
      <span className="font-mono">{term}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-[var(--hairline)]">
        <motion.span style={{ scaleX }} className={`block h-full origin-left rounded-full ${shared ? "bg-[#f5a300]" : "bg-accent"}`} />
      </span>
      <span className="relative text-end text-fg-2 tabular-nums">
        <motion.span style={{ opacity: countO }} className="absolute inset-0">
          {count}
        </motion.span>
        <motion.span style={{ opacity: scoreO }}>{score.toFixed(3)}</motion.span>
      </span>
    </li>
  );
}

export function HandsScene({ progress: p }: { progress: MotionValue<number> }) {
  // The chart only appears once the tokens collapse into it.
  const chart = useTransform(p, [COLLAPSE[0] - 0.02, COLLAPSE[0] + 0.02], [0, 1]);
  return (
    <div className="space-y-5" aria-hidden>
      <ul className="flex flex-wrap gap-x-1.5 gap-y-2">
        {tokens.map((tok, i) => (
          <Token key={i} p={p} tok={tok} i={i} />
        ))}
      </ul>
      <motion.ol style={{ opacity: chart }} className="space-y-1.5 still:opacity-100!">
        {bow.map(([term, count], i) => (
          <Bar key={String(term)} p={p} term={String(term)} count={Number(count)} score={Number(tfidf[i][1])} i={i} />
        ))}
      </motion.ol>
    </div>
  );
}
