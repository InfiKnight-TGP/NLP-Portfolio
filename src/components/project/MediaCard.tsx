"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useStill } from "@/lib/motionPrefs";

type Props = {
  label: string;
  href: string;
  /** Embed URL. Without one the card is a plain link (no iframe). */
  embed?: string;
  /** Shown under the card: what pressing it will load. */
  note: string;
  icon: "play" | "slides";
};

/**
 * Click-to-load facade: nothing is requested from the third party until the visitor presses play.
 * The iframe then materialises in place (blur + scale; a cross-fade when motion is still).
 */
export function MediaCard({ label, href, embed, note, icon }: Props) {
  const still = useStill();
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Keyboard users land in the player they just asked for.
  useEffect(() => {
    if (loaded) frame.current?.focus();
  }, [loaded]);

  const poster = (
    <>
      <Image
        src="/fisher-result.png"
        alt=""
        width={570}
        height={988}
        sizes="(min-width: 768px) 30rem, 90vw"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
      />
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(150deg,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_60%),linear-gradient(to_top,rgb(0_0_0/0.45),transparent_70%)]" />
      <span aria-hidden className="material relative grid h-16 w-16 place-items-center rounded-full text-fg shadow-[var(--shadow-lg)]">
        {icon === "play" ? (
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
            <path d="M7 4.5v15l12.5-7.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
            <path d="M12 16.5v3.5M8.5 20h7" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="absolute bottom-4 left-5 text-[1.0625rem] font-semibold text-white">{label}</span>
    </>
  );

  const posterClass =
    "press group relative grid aspect-video w-full place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-[#14161c] shadow-[var(--shadow-sm),inset_0_0_0_1px_var(--hairline)]";

  return (
    <figure>
      <div className="relative">
        {embed ? (
          loaded ? (
            <motion.div
              initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(14px)" }}
              animate={still ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={still ? { duration: 0.25 } : { type: "spring", bounce: 0, visualDuration: 0.45 }}
              className="aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-black shadow-[var(--shadow-lg)]"
            >
              <iframe
                ref={frame}
                src={embed}
                title={label}
                loading="lazy"
                allow="fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full border-0"
              />
            </motion.div>
          ) : (
            <button type="button" onClick={() => setLoaded(true)} aria-label={`Play ${label}. ${note}`} className={posterClass}>
              {poster}
            </button>
          )
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}. ${note}`} className={posterClass}>
            {poster}
          </a>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[0.875rem]">
        <span className="text-fg-3">{note}</span>
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline-offset-4 hover:underline">
          Open in new tab<span className="sr-only"> ({label})</span>
        </a>
      </figcaption>
    </figure>
  );
}
