"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/** A screenshot in a window frame that drifts and tilts slightly as it scrolls through view. */
export function DeviceMockup({
  src,
  alt,
  width,
  height,
  tilt = 1,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  tilt?: 1 | -1;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [2.5 * tilt, 0, -2.5 * tilt]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[22rem]">
      <motion.figure
        style={{ y, rotate, scale }}
        className="overflow-hidden rounded-[1.375rem] bg-[#1b1d22] p-1.5 shadow-[var(--shadow-lg)] ring-1 ring-black/10 motion-reduce:transform-none! dark:ring-white/12"
      >
        <div aria-hidden className="flex gap-1.5 px-2.5 pt-1.5 pb-2.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 768px) 22rem, 85vw"
          className="block h-auto w-full rounded-[1rem]"
        />
      </motion.figure>
    </div>
  );
}
