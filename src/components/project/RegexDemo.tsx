"use client";

import { useId, useState } from "react";
import { classify } from "@/lib/demoRules";

const TONE = {
  "High-risk patterns found": "bg-[#e5484d]",
  "Worth a closer look": "bg-[#f5b300]",
  "No clear pattern match": "bg-[#9a9aa0]",
  "Could not analyze": "bg-[#9a9aa0]",
};

/** Stretch goal: a few regex rules run on what you type. Explicitly not Fisher's engine. */
export function RegexDemo() {
  const id = useId();
  const [text, setText] = useState("");
  const result = classify(text);

  return (
    <div className="card spot p-6 sm:p-9">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#f5b300]/20 px-2.5 py-1 text-[0.75rem] font-semibold text-star-ink">
          Simplified demo
        </span>
        <span className="text-[0.8125rem] text-fg-3">Runs in your browser. Nothing is sent anywhere.</span>
      </div>
      <h3 className="display mt-4 text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)]">Try a few rules yourself.</h3>
      <p className="mt-3 max-w-[40rem] text-fg-2">
        This is <strong className="font-semibold text-fg">not the real Fisher engine</strong>. It is four
        hand-written regular expressions (urgency, credentials, links, money) to show the idea of
        rule-based signals. It has none of Fisher&rsquo;s normalisation, Indic-script handling or
        transliteration, and like Fisher, “no match” never means safe.
      </p>

      <label htmlFor={id} className="mt-6 block text-[0.875rem] font-semibold">
        Message to check
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Paste or type a message…"
        className="mt-2 w-full resize-y rounded-[var(--radius-sm)] bg-bg-2 p-4 text-[1rem] text-fg shadow-[inset_0_0_0_1px_var(--hairline)] placeholder:text-fg-3"
      />

      <div aria-live="polite" className="mt-5">
        <p className="flex items-center gap-3 text-[1.125rem] font-semibold">
          <span aria-hidden className={`h-3 w-3 shrink-0 rounded-full ${TONE[result.verdict]}`} />
          {result.verdict}
        </p>
        {result.hits.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-fg-2">
            {result.hits.map((h) => (
              <li key={h.label}>
                {h.label}:{" "}
                {h.matches.map((m) => (
                  <code key={m} className="mr-1.5 rounded-md bg-[var(--hairline)] px-1.5 py-0.5 text-[0.875rem] text-fg">
                    {m}
                  </code>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
