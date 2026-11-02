"use client";

import { MotionConfig } from "motion/react";

/** Motion components drop transform animations when the user asks for reduced motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
