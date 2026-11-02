"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { SPRING_OPTS } from "@/lib/physics";

/**
 * Portrait in a glass-edged frame. Tilts toward a mouse pointer (springs), and as the hero
 * scrolls away it scales down while a pre-blurred copy fades in: blur via opacity only,
 * so every frame stays on the compositor.
 */
export function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, SPRING_OPTS);
  const rotateY = useSpring(0, SPRING_OPTS);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.2", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const blur = useTransform(scrollYProgress, [0.1, 0.8], [0, 0.9]);

  function onPointerMove(e: React.PointerEvent) {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  }
  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="mx-auto w-full max-w-[20rem] [perspective:1000px] sm:max-w-[24rem]"
    >
      <motion.div
        style={{ rotateX, rotateY, scale }}
        className="relative motion-reduce:transform-none! aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#0c0c0e] shadow-[var(--shadow-lg)]"
      >
        <Image
          src="/portrait.jpg"
          alt="Portrait of Dinesh Raj N"
          width={880}
          height={1100}
          sizes="(min-width: 640px) 24rem, 20rem"
          preload
          className="h-full w-full object-cover"
        />
        <motion.div style={{ opacity: blur }} className="absolute inset-0 motion-reduce:hidden" aria-hidden>
            <Image
              src="/portrait.jpg"
              alt=""
              width={880}
              height={1100}
              sizes="(min-width: 640px) 24rem, 20rem"
              className="h-full w-full scale-110 object-cover blur-xl"
            />
        </motion.div>
        {/* Glass edge: a bright rim with light catching the top. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18),inset_0_1px_0_rgb(255_255_255/0.45)] [background:linear-gradient(160deg,rgb(255_255_255/0.14),transparent_35%)]"
        />
      </motion.div>
    </div>
  );
}
