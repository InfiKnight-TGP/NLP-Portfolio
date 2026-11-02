"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { COS, KING, MAN, QUEEN, RESULT, angle } from "./caseSceneData";

// Hand-placed 2-D coordinates for illustration only (plane units, y up). Not from any model.
const S = 100; // SVG units per plane unit
const P = (x: number, y: number) => [x * S, -y * S] as const;

const STATIC = [
  { w: "river", at: P(-0.78, 0.5) },
  { w: "water", at: P(-0.6, 0.78) },
  { w: "money", at: P(0.72, 0.62) },
  { w: "loan", at: P(0.86, 0.32) },
];
const BANK = P(0.06, 0.66);
const BANK_RIVER = P(-0.5, 0.48);
const BANK_MONEY = P(0.52, 0.46);

// Scene phases on the 0..1 scroll progress.
const PH: Record<"words" | "split" | "analogy" | "cosine", [number, number]> = {
  words: [0.02, 0.22],
  split: [0.3, 0.5],
  analogy: [0.56, 0.84],
  cosine: [0.86, 0.96],
};


function Dot({ p, at, label, from, color = "var(--fg)", end = false }: { p: MotionValue<number>; at: readonly [number, number]; label: string; from: number; color?: string; end?: boolean }) {
  const o = useTransform(p, [from, from + 0.05], [0, 1]);
  return (
    <motion.g style={{ opacity: o }}>
      <circle cx={at[0]} cy={at[1]} r={3.5} fill={color} />
      <text x={at[0] + (end ? -6 : 6)} y={at[1] - 6} textAnchor={end ? "end" : "start"} className="fill-fg-2 text-[9px] font-medium">
        {label}
      </text>
    </motion.g>
  );
}

function Arrow({ p, a, b, range, color, label }: { p: MotionValue<number>; a: number[]; b: number[]; range: [number, number]; color: string; label?: string }) {
  const draw = useTransform(p, range, [0, 1]);
  const head = useTransform(draw, [0.9, 1], [0, 1]);
  const [x1, y1] = P(a[0], a[1]);
  const [x2, y2] = P(b[0], b[1]);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      <motion.path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none" style={{ pathLength: draw }} />
      <motion.g style={{ opacity: head }}>
        <path d="M0 0 L-8 -4 L-8 4 Z" fill={color} transform={`translate(${x2} ${y2}) rotate(${ang})`} />
        {label && (
          <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 6} className="text-[8.5px] font-semibold" fill={color}>
            {label}
          </text>
        )}
      </motion.g>
    </g>
  );
}

export function CaseScene({ progress: p }: { progress: MotionValue<number> }) {
  // Cluster A (words + bank split) fades out as the analogy begins.
  const clusterA = useTransform(p, [0.52, 0.58], [1, 0]);
  const bankStatic = useTransform(p, [PH.split[0], PH.split[0] + 0.04], [1, 0]);
  const t = useTransform(p, [PH.split[0], PH.split[1]], [0, 1]);
  const rx = useTransform(t, [0, 1], [BANK[0], BANK_RIVER[0]]);
  const ry = useTransform(t, [0, 1], [BANK[1], BANK_RIVER[1]]);
  const mx = useTransform(t, [0, 1], [BANK[0], BANK_MONEY[0]]);
  const my = useTransform(t, [0, 1], [BANK[1], BANK_MONEY[1]]);
  const splitOn = useTransform(p, [PH.split[0], PH.split[0] + 0.03], [0, 1]);
  const analogyOn = useTransform(p, [0.54, 0.58], [0, 1]);
  const cosOn = useTransform(p, PH.cosine, [0, 1]);

  // Cosine arc between the result vector and queen.
  const r = 34;
  const a1 = angle(RESULT);
  const a2 = angle(QUEEN);
  const arc = `M${r * Math.cos(a1)} ${-r * Math.sin(a1)} A${r} ${r} 0 0 0 ${r * Math.cos(a2)} ${-r * Math.sin(a2)}`;
  const [qx, qy] = P(QUEEN[0], QUEEN[1]);
  const [resx, resy] = P(RESULT[0], RESULT[1]);

  return (
    <svg viewBox="-125 -105 250 175" className="h-full w-full" aria-hidden>
      <line x1={-120} x2={120} y1={0} y2={0} stroke="var(--hairline)" />
      <line x1={0} x2={0} y1={-100} y2={65} stroke="var(--hairline)" />

      <motion.g style={{ opacity: clusterA }}>
        {STATIC.map((s, i) => (
          <Dot key={s.w} p={p} at={s.at} label={s.w} from={PH.words[0] + i * 0.035} />
        ))}
        <motion.g style={{ opacity: bankStatic }}>
          <Dot p={p} at={BANK} label="bank" from={PH.words[0] + 0.16} color="var(--accent)" />
        </motion.g>
        <motion.g style={{ opacity: splitOn }}>
          <motion.g style={{ x: rx, y: ry }}>
            <circle r={4} fill="var(--accent)" />
            <text y={15} textAnchor="middle" className="fill-accent text-[8.5px] font-semibold">bank · “river bank”</text>
          </motion.g>
          <motion.g style={{ x: mx, y: my }}>
            <circle r={4} fill="#bf5af2" />
            <text y={15} textAnchor="middle" className="text-[8.5px] font-semibold" fill="#bf5af2">
              bank · “bank loan”
            </text>
          </motion.g>
        </motion.g>
      </motion.g>

      <motion.g style={{ opacity: analogyOn }}>
        <Dot p={p} at={P(QUEEN[0], QUEEN[1])} label="queen" from={0.56} color="#30a14e" end />
        <Arrow p={p} a={[0, 0]} b={KING} range={[0.58, 0.65]} color="var(--fg)" label="king" />
        <Arrow p={p} a={KING} b={[KING[0] - MAN[0], KING[1] - MAN[1]]} range={[0.66, 0.74]} color="#e5484d" label="− man" />
        <Arrow p={p} a={[KING[0] - MAN[0], KING[1] - MAN[1]]} b={RESULT} range={[0.75, 0.83]} color="var(--accent)" label="+ woman" />
        <Dot p={p} at={[resx, resy]} label="" from={0.82} color="var(--accent)" />
      </motion.g>

      <motion.g style={{ opacity: cosOn }}>
        <line x1={0} y1={0} x2={qx} y2={qy} stroke="#30a14e" strokeDasharray="3 3" strokeWidth={1.4} />
        <line x1={0} y1={0} x2={resx} y2={resy} stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1.4} />
        <path d={arc} fill="none" stroke="var(--star)" strokeWidth={2} />
        <text x={-115} y={40} className="fill-fg text-[9px] font-semibold">
          θ · cos θ ≈ {COS.toFixed(2)}
        </text>
      </motion.g>
    </svg>
  );
}
