"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "@/lib/physics";

const LINKS = [
  { id: "stars", label: "Stars" },
  { id: "case-study", label: "Case Study" },
  { id: "project", label: "Project" },
  { id: "hands-on", label: "Hands-On" },
  { id: "class", label: "Class" },
];

export function Nav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const hero = document.getElementById("top");
    const els = [hero, ...LINKS.map((l) => document.getElementById(l.id))];
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="material sticky top-0 z-40 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-[var(--material-solid)]/60 after:to-transparent">
      <nav
        aria-label="Sections"
        className="mx-auto flex h-12 max-w-[68rem] items-center gap-4 px-4 sm:px-8"
      >
        <a
          href="#top"
          className="hidden shrink-0 rounded-md text-[0.9375rem] font-semibold tracking-[-0.01em] md:block"
        >
          Dinesh Raj N
        </a>
        <ul className="no-scrollbar -mx-2 flex flex-1 items-center gap-0.5 overflow-x-auto px-2 md:justify-end">
          {LINKS.map((l) => (
            <li key={l.id} className="relative shrink-0">
              {active === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-full bg-[var(--hairline)]"
                  aria-hidden
                />
              )}
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className="press relative block rounded-full px-3 py-1.5 text-[0.875rem] font-medium text-fg-2 aria-[current]:text-fg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
