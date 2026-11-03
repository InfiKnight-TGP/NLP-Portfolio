"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { presenting } from "@/lib/content";
import presenting1 from "../../../public/presenting-1.jpg";
import presenting2 from "../../../public/presenting-2.jpg";
import { PhotoSheet, type Photo } from "./PhotoSheet";

const PHOTOS: Photo[] = [
  { src: presenting1, ...presenting[0] },
  { src: presenting2, ...presenting[1] },
];

export function Presenting() {
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="presenting-title">
      <h3 id="presenting-title" className="display text-[clamp(1.75rem,1.3rem+2vw,2.75rem)]">
        Presenting
      </h3>
      <ul className="mt-8 grid gap-8 md:grid-cols-2">
        {PHOTOS.map((p, i) => (
          <li key={i}>
            <figure>
              <button
                ref={(el) => void (thumbs.current[i] = el)}
                type="button"
                onClick={() => setOpen(i)}
                aria-haspopup="dialog"
                aria-label={`Open photo ${i + 1} of ${PHOTOS.length}: ${p.alt}`}
                className="photo-thumb card block w-full overflow-hidden p-0 transition-transform duration-100 ease-out active:scale-[0.98]"
              >
                <Image
                  src={p.src}
                  alt=""
                  sizes="(min-width: 768px) 32rem, 92vw"
                  placeholder="blur"
                  loading="lazy"
                  draggable={false}
                  className="block aspect-[864/720] h-auto w-full object-cover"
                />
              </button>
              <figcaption className="mt-3 text-[0.875rem]">
                <span className="font-semibold">{p.caption}</span>{" "}
                <span className="text-fg-3">
                  {i + 1} of {PHOTOS.length}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {open !== null && (
        <PhotoSheet
          photos={PHOTOS}
          index={open}
          onIndex={setOpen}
          origin={(i) => thumbs.current[i]}
          onClosed={() => {
            thumbs.current[open]?.focus({ preventScroll: true });
            setOpen(null);
          }}
        />
      )}
    </section>
  );
}
