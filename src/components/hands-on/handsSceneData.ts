// Captions for the hands-on scene. Every example is read from NLTK's real output (nltk-pipeline.json).
import data from "@/data/nltk-pipeline.json";

const s1 = (w: string) => data.stems.find(([a]) => a === w)?.[1];
const l1 = (w: string) => data.lemmas.find(([a]) => a === w)?.[1];
const wrongOrg = data.entities.filter(([e, label]) => label === "ORGANIZATION" && /Natural|Fall Semester/.test(e)).map(([e]) => `“${e}”`);
const removed = data.scene.tokens.filter((t) => t.removed);

export const STEPS = [
  { range: [0, 0.13], title: "Tokenisation", text: `word_tokenize splits the sentence into ${data.scene.tokens.length} tokens, punctuation included.` },
  {
    range: [0.13, 0.27],
    title: "Stop words and cleaning",
    text: `${removed.length} tokens go: stop words like “${removed.find((t) => t.removed === "stop")?.t}”, and non-alphabetic tokens, which here includes “hands-on”.`,
  },
  { range: [0.27, 0.41], title: "Stemming", text: `PorterStemmer cuts suffixes by rule. Elsewhere in the text: studied → ${s1("studied")}.` },
  { range: [0.41, 0.53], title: "Lemmatisation", text: `WordNet returns dictionary forms. Here they match the stems; for studied it gives ${l1("studied")}.` },
  { range: [0.53, 0.65], title: "POS tags", text: "pos_tag adds a Penn Treebank tag to every token." },
  {
    range: [0.65, 0.75],
    title: "Named entities",
    text: `ne_chunk marks NLTK as ORGANIZATION. Its mistakes stay: on the first sentence it also tags ${wrongOrg.join(" and ")} as ORGANIZATION.`,
  },
  { range: [0.75, 0.87], title: "Bag of words", text: "The remaining lemmas collapse into counts: every word appears once." },
  { range: [0.87, 1.01], title: "TF-IDF", text: "TF-IDF re-weights the bars: “turn” and “word” also appear in another sentence, so they count for less." },
];
