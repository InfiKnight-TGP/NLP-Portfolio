// All copy comes from content/portfolio.md. Keep the two in sync.

export const person = {
  name: "Dinesh Raj N",
  university: "VIT",
  courseCode: "CSI4001",
  courseTitle: "Natural Language Processing",
  slot: "F1+TF1",
  semester: "Fall Semester 2026-27",
  guide: "Dr. Sharmila Banu K",
};

export const stars = {
  total: 15,
  intro: "I earned a total of 15 stars throughout the course. The notable ones are:",
  photoAlt:
    "The index page of my notebook, with the stars and the faculty's signatures.",
  moments: [
    { count: 2, title: "An interactive question about words" },
    { count: 1, title: "Recalling the keywords from the previous class", detail: "COCA" },
    {
      count: 1,
      title: "A three-syllable word in our mother tongue",
      detail: "“irukettaethirmarai”",
    },
    { count: 1, title: "Recalling the key words of the current session", detail: "Brown Corpus" },
    { count: 1, title: "Remembering the formula for n-gram" },
    { count: 1, title: "Solving a problem on the class board" },
    { count: 2, title: "Solving a numerical on the Viterbi algorithm" },
    {
      count: 2,
      title: "In my CAT 1 answer paper",
      detail: "For minimum edit distance and another numerical",
    },
  ],
};

export const caseStudy = {
  body: [
    "During my research on this case study, I learned about cutting-edge embedding models such as Word2Vec, GloVe, FastText, BERT and Sentence-BERT. These models help in understanding how text can be transformed into vectors for words and sentences. I also learned how embeddings can be evaluated using cosine similarity and analogy.",
    "I have also seen how models such as MuRIL, IndicBERT and IndicSBERT help with multilingual text, including transliteration. However, there are challenges and opportunities in creating NLP systems that process regional Indian languages.",
  ],
  models: [
    { name: "Word2Vec", kind: "Word vectors", line: "Learns one static vector per word by predicting a word from its context (CBOW) or the context from a word (skip-gram)." },
    { name: "GloVe", kind: "Word vectors", line: "Learns static word vectors from global word–word co-occurrence counts across a whole corpus." },
    { name: "FastText", kind: "Word vectors", line: "Builds word vectors from character n-grams, so it can represent rare and unseen words." },
    { name: "BERT", kind: "Contextual", line: "A Transformer encoder pre-trained with masked language modelling; a word’s vector changes with its sentence." },
    { name: "Sentence-BERT", kind: "Sentence vectors", line: "Fine-tunes BERT with siamese networks so whole sentences can be compared directly with cosine similarity." },
    { name: "MuRIL", kind: "Indian languages", line: "Google’s BERT model pre-trained on Indian languages and English, including transliterated (Romanised) text." },
    { name: "IndicBERT", kind: "Indian languages", line: "AI4Bharat’s compact multilingual model, pre-trained on large corpora of Indian languages." },
    { name: "IndicSBERT", kind: "Indian languages", line: "L3Cube’s Sentence-BERT models for Indian languages, giving sentence vectors that work across languages." },
  ],
};

export const fisher = {
  learned:
    "By working on this project, I learned how to design and build an NLP system that solves a real problem. I learned how to handle scam messages in Indian languages using clear, rule-based methods, including normalising Unicode text, handling Indic scripts and Romanised code-mixing. I learned how to create transliteration suggestions and how to measure the performance of my system using source-wise metrics, error analysis and McNemar’s test. I also learned about privacy by design when building browser extensions, as well as automated testing and continuous integration.",
  honesty:
    "Finally, I learned the importance of being honest about findings, being aware of limitations, and not making assumptions that the evidence cannot support.",
  team: "Team project with Rithik V. Guide: Dr. Sharmila Banu K.",
  results: [
    { label: "High-risk patterns found", tone: "high" },
    { label: "Worth a closer look", tone: "review" },
    { label: "No clear pattern match", tone: "none" },
    { label: "Could not analyze", tone: "none" },
  ],
};

export const handsOn =
  "I learned the basic concepts of NLP using libraries such as NLTK during the hands-on session. I learned pre-processing techniques such as tokenisation, stop-word removal, stemming, lemmatisation and text cleaning. I also learned POS tagging, named entity recognition and frequency distribution to analyse text. Furthermore, I learned the basics of text vectorisation, such as bag of words and TF-IDF, which helped me understand how text can be turned into vectors.";

export const interaction = {
  intro:
    "I took an active part in class discussions and interactions. Some earned me stars and some were simply fun.",
  cards: [
    { kind: "Sarcasm in the mother tongue", front: "Sarcasm", back: "“Donkey can’t smell camphor”" },
    { kind: "Metaphor", front: "Metaphor", back: "“Two roads diverged in a yellow wood” — Robert Frost" },
    {
      kind: "Translation check",
      front: "Kamba Ramayanam",
      back: "Reviewing an ancient Kamba Ramayanam passage translated by an LLM against the actual translation, and checking whether they mean the same.",
    },
  ],
};
