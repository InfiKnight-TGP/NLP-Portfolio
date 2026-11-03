"use client";

import { Fragment, useRef } from "react";
import { useReveal } from "@/lib/useReveal";

/**
 * Words rise through masks with a spring stagger when the title enters view (CSS, see .kinetic).
 * When motion is still, the title cross-fades in instead.
 */
export function KineticTitle({ text, id, className = "" }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useReveal(ref);
  const words = text.split(" ");
  return (
    <h2 ref={ref} id={id} className={`kinetic ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <span className="kinetic-word inline-block" style={{ "--i": i } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {/* The space lives outside the inline-block mask, where it would be trimmed. */}
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </h2>
  );
}
