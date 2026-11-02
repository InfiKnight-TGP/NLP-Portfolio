"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useAmbientActive } from "@/lib/motionPrefs";

const HeroIntro = dynamic(() => import("./HeroIntro").then((m) => m.HeroIntro), { ssr: false });

/** Hero shell: recedes (scale + fade) as you scroll away, hosts the intro canvas and the ambient mesh. */
export function HeroStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const meshOn = useAmbientActive(meshRef);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative">
      {/* Very slow, faint gradient mesh. Cycles of 26-40 s; paused off-screen, in hidden tabs and when still. */}
      <div
        ref={meshRef}
        aria-hidden
        data-active={meshOn}
        className="mesh pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <span className="mesh-blob mesh-a" />
        <span className="mesh-blob mesh-b" />
        <span className="mesh-blob mesh-c" />
      </div>
      <motion.div
        style={{ scale, opacity }}
        className="relative mx-auto grid max-w-[68rem] origin-top items-center gap-12 px-5 pt-12 pb-8 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-12 still:transform-none! still:opacity-100!"
      >
        {children}
        <HeroIntro titleId="hero-title" />
      </motion.div>
    </section>
  );
}
