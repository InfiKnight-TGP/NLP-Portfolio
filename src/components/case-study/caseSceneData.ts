// Shared by the lazy case-study scene and its captions. Hand-placed, illustrative values only.

export const KING = [0.95, 0.6];
export const MAN = [0.9, -0.2];
export const WOMAN = [-0.45, -0.25];
export const QUEEN = [-0.62, 0.42];
export const RESULT = [KING[0] - MAN[0] + WOMAN[0], KING[1] - MAN[1] + WOMAN[1]];
export const angle = (v: number[]) => Math.atan2(v[1], v[0]);
export const COS = Math.cos(angle(QUEEN) - angle(RESULT));

export const CAPTIONS = [
  { range: [0, 0.27], title: "Word2Vec and GloVe", text: "One static vector per word. “bank” gets a single point, somewhere between rivers and money." },
  { range: [0.27, 0.53], title: "BERT: context decides", text: "A contextual model gives the same word a different vector in each sentence: the river bank and the money bank split apart." },
  { range: [0.53, 0.85], title: "Vector arithmetic", text: "Analogy as addition: king − man + woman lands close to queen." },
  { range: [0.85, 1.01], title: "Cosine similarity", text: `Closeness is the angle between vectors. Here cos θ ≈ ${COS.toFixed(2)}.` },
];
