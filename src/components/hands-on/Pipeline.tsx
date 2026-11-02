"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import data from "@/data/nltk-pipeline.json";
import { SPRING, SPRING_OPTS } from "@/lib/physics";

const chip = "inline-block rounded-md bg-[var(--hairline)] px-2 py-1 font-mono text-[0.8125rem] leading-none text-fg";

function Pairs({ pairs }: { pairs: string[][] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {pairs.map(([a, b], i) => (
        <li key={i} className={chip}>
          {a}
          {a !== b && (
            <>
              <span className="px-1 text-fg-3" aria-label="becomes">
                →
              </span>
              <span className="font-semibold text-accent">{b}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <li key={i} className={chip}>
          {t}
        </li>
      ))}
    </ul>
  );
}

const STEPS: { title: string; note: string; body: React.ReactNode }[] = [
  {
    title: "Raw text",
    note: "Three sentences in, as plain text.",
    body: <p className="font-mono text-[0.875rem] leading-relaxed text-fg">{data.text}</p>,
  },
  {
    title: "Tokenisation",
    note: `word_tokenize splits the text into ${data.tokens.length} tokens, punctuation included.`,
    body: <Chips items={data.tokens} />,
  },
  {
    title: "Stop-word removal and cleaning",
    note: `Lower-case, keep alphabetic tokens, drop English stop words: ${data.stopwordsRemoved.length} remain.`,
    body: <Chips items={data.stopwordsRemoved} />,
  },
  {
    title: "Stemming",
    note: "PorterStemmer chops suffixes by rule, so stems need not be real words.",
    body: <Pairs pairs={data.stems} />,
  },
  {
    title: "Lemmatisation",
    note: "WordNetLemmatizer, given each word's POS tag, returns dictionary forms.",
    body: <Pairs pairs={data.lemmas} />,
  },
  {
    title: "POS tags",
    note: "pos_tag labels each token with a Penn Treebank tag.",
    body: (
      <ul className="flex flex-wrap gap-1.5">
        {data.pos.map(([w, t], i) => (
          <li key={i} className={chip}>
            {w}
            <span className="ml-1.5 text-[0.6875rem] font-semibold text-accent">{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Named entities",
    note: "ne_chunk's real output, mistakes included: it is a small statistical chunker.",
    body: (
      <ul className="flex flex-wrap gap-1.5">
        {data.entities.map(([e, label], i) => (
          <li key={i} className={chip}>
            {e}
            <span className="ml-1.5 text-[0.6875rem] font-semibold text-accent">{label}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Bag of words",
    note: `Each sentence becomes a count vector over a ${data.bow.vocab.length}-lemma vocabulary.`,
    body: (
      <ol className="space-y-3">
        {data.bow.rows.map((row, i) => (
          <li key={i}>
            <p className="text-[0.8125rem] font-semibold text-fg-3">Sentence {i + 1}</p>
            <p className="mt-1 font-mono text-[0.8125rem] break-all text-fg">[{row.join(", ")}]</p>
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: "TF-IDF",
    note: "TextCollection.tf_idf: words shared across sentences, like “turn” and “word”, score lower.",
    body: (
      <ol className="space-y-5">
        {data.tfidf.map((terms, i) => {
          const max = Math.max(...terms.map((t) => Number(t[1])));
          return (
            <li key={i}>
              <p className="text-[0.8125rem] font-semibold text-fg-3">Sentence {i + 1}</p>
              <ul className="mt-2 space-y-1.5">
                {terms.slice(0, 6).map(([w, s]) => (
                  <li key={String(w)} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-[0.8125rem]">
                    <span className="truncate font-mono">{w}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-[var(--hairline)]">
                      <span
                        className="block h-full origin-left rounded-full bg-accent"
                        style={{ transform: `scaleX(${Number(s) / max})` }}
                      />
                    </span>
                    <span className="text-end text-fg-2 tabular-nums">{Number(s).toFixed(3)}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    ),
  },
];

/** The NLTK pipeline as a scroll-linked timeline: the rail fills as you read down. */
export function Pipeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const fill = useSpring(scrollYProgress, SPRING_OPTS);

  return (
    <div className="relative">
      <div aria-hidden className="absolute top-2 bottom-2 left-[0.6875rem] w-0.5 rounded-full bg-[var(--hairline)]">
        <motion.div style={{ scaleY: fill }} className="h-full w-full origin-top rounded-full bg-accent still:transform-none!" />
      </div>
      <ol ref={ref} className="space-y-6">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={SPRING}
            className="relative pl-10"
          >
            <span
              aria-hidden
              className="absolute top-5 left-0 grid h-6 w-6 place-items-center rounded-full bg-accent text-[0.6875rem] font-bold text-white dark:text-black"
            >
              {i + 1}
            </span>
            <div className="card spot p-5 sm:p-7">
              <h3 className="text-[1.25rem] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-1 text-[0.9375rem] text-fg-2">{s.note}</p>
              <div className="mt-4">{s.body}</div>
            </div>
          </motion.li>
        ))}
      </ol>
      <p className="mt-6 pl-10 text-[0.8125rem] text-fg-3">
        Every output above was produced by running NLTK {data.nltkVersion} (scripts/nltk_pipeline.py)
        and saved as static JSON.
      </p>
    </div>
  );
}
