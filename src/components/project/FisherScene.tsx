"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, motionValue, useTransform, type MotionValue } from "motion/react";

// Illustrative walkthrough of the rule idea. Not Fisher's engine: no real rules run here.
const CAT = {
  impersonation: { label: "Impersonation", color: "#bf5af2" },
  credential: { label: "Credential", color: "#e5484d" },
  action: { label: "Action", color: "#f5a300" },
  link: { label: "Link", color: "#0a84ff" },
} as const;
type Cat = keyof typeof CAT;

const MSG_A: { t: string; cat?: Cat }[] = [
  { t: "Dear SBI customer", cat: "impersonation" },
  { t: ", " },
  { t: "your KYC expired", cat: "credential" },
  { t: ". " },
  { t: "Update now", cat: "action" },
  { t: ": " },
  { t: "sbi-kyc-update.xyz", cat: "link" },
];
const MSG_B = "Running 10 minutes late, see you at the library.";
// Genuine "evidence noticed" lines from Fisher's result panel (project screenshot).
const REASONS = [
  "Mentions account verification or sensitive credentials.",
  "Uses urgency, expiry, suspension, or immediate-pressure language.",
  "Pushes the reader to click, open, call, send, share, or update.",
];
const SIGNALS = MSG_A.filter((s) => s.cat).map((s) => s.cat!);

const LEN_A = MSG_A.reduce((n, s) => n + s.t.length, 0);
// Character offset of each segment and, for signal segments, their index in SIGNALS.
const SEGS = MSG_A.map((seg, i) => ({
  seg,
  start: MSG_A.slice(0, i).reduce((n, s) => n + s.t.length, 0),
  k: seg.cat ? MSG_A.slice(0, i).filter((s) => s.cat).length : -1,
}));
const T = {
  typeA: [0.02, 0.18],
  sweep: [0.2, 0.38],
  fly: [0.4, 0.54],
  gaugeUp: [0.55, 0.64],
  reasons: [0.62, 0.72],
  shrinkA: [0.76, 0.8],
  typeB: [0.8, 0.86],
  gaugeDown: [0.86, 0.9],
  note: [0.92, 0.96],
} as const satisfies Record<string, readonly [number, number]>;
const r = (k: keyof typeof T) => [...T[k]] as [number, number];

function Char({ p, i, total, range, ch }: { p: MotionValue<number>; i: number; total: number; range: [number, number]; ch: string }) {
  const at = range[0] + ((range[1] - range[0]) * i) / total;
  const o = useTransform(p, [at, at + 0.002], [0, 1]);
  return <motion.span style={{ opacity: o }}>{ch}</motion.span>;
}

function Typed({ p, text, offset, total, range }: { p: MotionValue<number>; text: string; offset: number; total: number; range: [number, number] }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <Char key={i} p={p} i={offset + i} total={total} range={range} ch={ch} />
      ))}
    </>
  );
}

function Segment({ p, seg, k, offset, segRef }: { p: MotionValue<number>; seg: (typeof MSG_A)[number]; k: number; offset: number; segRef: (el: HTMLSpanElement | null) => void }) {
  const [a, b] = r("sweep");
  const step = (b - a) / SIGNALS.length;
  const sweep = useTransform(p, [a + k * step, a + (k + 1) * step], [0, 1]);
  return (
    <span ref={segRef} className="relative inline-block">
      <motion.span
        aria-hidden
        style={{ scaleX: sweep, backgroundColor: CAT[seg.cat!].color }}
        className="absolute -inset-x-0.5 inset-y-0 origin-left rounded-[4px] opacity-25"
      />
      <span className="relative">
        <Typed p={p} text={seg.t} offset={offset} total={LEN_A} range={r("typeA")} />
      </span>
    </span>
  );
}

/** A chip that starts over its highlighted words and flies into the tray. */
function Chip({ p, cat, i, offset }: { p: MotionValue<number>; cat: Cat; i: number; offset: { x: MotionValue<number>; y: MotionValue<number> } }) {
  const [a, b] = r("fly");
  const step = (b - a) / SIGNALS.length;
  const k = useTransform(p, [a + i * step, a + (i + 1.6) * step], [0, 1]);
  const x = useTransform(() => offset.x.get() * (1 - k.get()));
  const y = useTransform(() => offset.y.get() * (1 - k.get()));
  const opacity = useTransform(p, [a + i * step - 0.01, a + i * step, 0.8, 0.84], [0, 1, 1, 0]);
  const scale = useTransform(k, [0, 0.5, 1], [0.9, 1.08, 1]);
  return (
    <motion.span
      style={{ x, y, opacity, scale, color: CAT[cat].color, borderColor: CAT[cat].color }}
      className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-[0.75rem] font-semibold"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {CAT[cat].label}
    </motion.span>
  );
}

function Fade({ p, range, children, className = "", out }: { p: MotionValue<number>; range: [number, number]; children: React.ReactNode; className?: string; out?: [number, number] }) {
  const input = out ? [range[0], range[1], out[0], out[1]] : range;
  const opacity = useTransform(p, input, out ? [0, 1, 1, 0] : [0, 1]);
  const y = useTransform(p, range, [8, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function Gauge({ p }: { p: MotionValue<number> }) {
  const level = useTransform(p, [...T.gaugeUp, ...T.gaugeDown], [0.04, 0.92, 0.92, 0.1]);
  const rot = useTransform(level, (l) => -90 + 180 * l);
  const high = useTransform(p, [T.gaugeDown[0], T.gaugeDown[0] + 0.02], [1, 0]);
  const low = useTransform(high, (h) => 1 - h);
  const arc = "M10 60 A50 50 0 0 1 110 60";
  return (
    <svg viewBox="0 0 120 68" className="w-28 shrink-0 sm:w-48" aria-hidden>
      <path d={arc} fill="none" stroke="var(--hairline)" strokeWidth="9" strokeLinecap="round" />
      <motion.path d={arc} fill="none" stroke="#e5484d" strokeWidth="9" strokeLinecap="round" style={{ pathLength: level, opacity: high }} />
      <motion.path d={arc} fill="none" stroke="#9a9aa0" strokeWidth="9" strokeLinecap="round" style={{ pathLength: level, opacity: low }} />
      <motion.g style={{ rotate: rot, originX: 0.5, originY: 1 }}>{/* fill-box origin: the needle's base */}
        <line x1="60" y1="60" x2="60" y2="20" stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      <circle cx="60" cy="60" r="4" fill="var(--fg)" />
    </svg>
  );
}

export function FisherScene({ progress: p }: { progress: MotionValue<number> }) {
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Flight offsets (segment centre minus chip's resting centre), measured from layout.
  const [offsets] = useState(() => SIGNALS.map(() => ({ x: motionValue(0), y: motionValue(0) })));

  useLayoutEffect(() => {
    const measure = () =>
      SIGNALS.forEach((_, i) => {
        const s = segRefs.current[i]?.getBoundingClientRect();
        const c = chipRefs.current[i]?.getBoundingClientRect();
        if (!s || !c) return;
        // Both refs are untransformed wrappers, so these are resting layout positions.
        offsets[i].x.set(s.left + s.width / 2 - (c.left + c.width / 2));
        offsets[i].y.set(s.top + s.height / 2 - (c.top + c.height / 2));
      });
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [offsets]);

  const shrinkA = useTransform(p, r("shrinkA"), [1, 0.92]);
  const dimA = useTransform(p, r("shrinkA"), [1, 0.75]);

  return (
    <div className="grid w-full gap-5 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-10">
      <div className="space-y-3">
        <motion.div style={{ scale: shrinkA, opacity: dimA }} className="card origin-top-left p-4 sm:p-5">
          <p className="text-[0.75rem] font-semibold text-fg-3">Message 1</p>
          <p className="mt-2 font-mono text-[0.9375rem] leading-relaxed text-fg sm:text-[1rem]">
            {SEGS.map(({ seg, start, k }, i) =>
              k < 0 ? (
                <Typed key={i} p={p} text={seg.t} offset={start} total={LEN_A} range={r("typeA")} />
              ) : (
                <Segment key={i} p={p} seg={seg} k={k} offset={start} segRef={(el) => void (segRefs.current[k] = el)} />
              ),
            )}
          </p>
          <Fade p={p} range={[0.78, 0.8]} className="mt-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e5484d]/12 px-2.5 py-1 text-[0.8125rem] font-semibold text-[#c02a2f] dark:text-[#ff8a8e]">
              <span className="h-2 w-2 rounded-full bg-[#e5484d]" /> High-risk patterns found
            </span>
            {/* The reasons stay with the message they belong to once the tray moves on. */}
            <ul className="mt-2 space-y-0.5 text-[0.75rem] text-fg-2">
              {REASONS.map((reason) => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
          </Fade>
        </motion.div>

        <Fade p={p} range={[T.typeB[0] - 0.01, T.typeB[0]]} className="card p-4 sm:p-5">
          <p className="text-[0.75rem] font-semibold text-fg-3">Message 2</p>
          <p className="mt-2 font-mono text-[0.9375rem] leading-relaxed text-fg sm:text-[1rem]">
            <Typed p={p} text={MSG_B} offset={0} total={MSG_B.length} range={r("typeB")} />
          </p>
        </Fade>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="text-[0.75rem] font-semibold text-fg-3">Signals</p>
        <div className="mt-2 flex min-h-8 flex-wrap gap-1.5">
          {SIGNALS.map((cat, i) => (
            <span key={cat} ref={(el) => void (chipRefs.current[i] = el)}>
              <Chip p={p} cat={cat} i={i} offset={offsets[i]} />
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-end gap-4 sm:mt-4">
          <Gauge p={p} />
          <div className="relative h-14 flex-1">
            <Fade p={p} range={[0.53, 0.55]} out={[0.6, 0.62]} className="absolute inset-0 flex items-end text-[1rem] font-semibold text-fg-3">
              Checking…
            </Fade>
            <Fade p={p} range={[0.61, 0.64]} out={[0.84, 0.86]} className="absolute inset-0 flex items-end text-[1.125rem] leading-tight font-semibold text-[#c02a2f] dark:text-[#ff8a8e]">
              High-risk patterns found
            </Fade>
            <Fade p={p} range={[0.87, 0.9]} className="absolute inset-0 flex items-end text-[1.125rem] leading-tight font-semibold text-fg">
              No clear pattern match
            </Fade>
          </div>
        </div>
        <div className="relative mt-3 min-h-[5.5rem] sm:mt-4 sm:min-h-[6.5rem]">
          <ul className="absolute inset-0 space-y-1 text-[0.75rem] leading-snug text-fg-2 sm:space-y-1.5 sm:text-[0.875rem]">
            {REASONS.map((reason, i) => {
              const [a, b] = r("reasons");
              const s = a + ((b - a) * i) / REASONS.length;
              return (
                <li key={reason}>
                  <Fade p={p} range={[s, s + 0.03]} out={[0.84, 0.86]} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-3" />
                    {reason}
                  </Fade>
                </li>
              );
            })}
          </ul>
          <Fade p={p} range={r("note")} className="absolute inset-0 text-[0.9375rem] text-fg-2">
            “No match” never means safe.
          </Fade>
        </div>
      </div>
    </div>
  );
}
