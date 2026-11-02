"""Generate the Hands-On Session example outputs with real NLTK.

Run from the project root:
    python -m pip install -r scripts/requirements.txt
    python scripts/nltk_pipeline.py

Writes src/data/nltk-pipeline.json. The site only reads that file; nothing
in it is hand-written.
"""

import json
from pathlib import Path

import nltk
from nltk.corpus import stopwords, wordnet
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.text import TextCollection

for pkg in [
    "punkt_tab",
    "stopwords",
    "wordnet",
    "omw-1.4",
    "averaged_perceptron_tagger_eng",
    "maxent_ne_chunker_tab",
    "words",
]:
    nltk.download(pkg, quiet=True)

# Sentences drawn from the portfolio itself, so the demo text is true.
TEXT = (
    "At VIT, Dinesh Raj N studied Natural Language Processing with Dr. Sharmila Banu K in the Fall Semester. "
    "The hands-on session used NLTK to turn words into tokens, stems and lemmas. "
    "Bag of words and TF-IDF turn text into vectors."
)


def wordnet_pos(tag: str) -> str:
    return {"J": wordnet.ADJ, "V": wordnet.VERB, "R": wordnet.ADV}.get(tag[0], wordnet.NOUN)


stop = set(stopwords.words("english"))
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

sentences = nltk.sent_tokenize(TEXT)
tokens = nltk.word_tokenize(TEXT)
tagged = nltk.pos_tag(tokens)

# Cleaning + stop-word removal: keep alphabetic tokens, lowercase, drop stop words.
content = [(w.lower(), t) for w, t in tagged if w.isalpha() and w.lower() not in stop]

stems = [[w, stemmer.stem(w)] for w, _ in content]
lemmas = [[w, lemmatizer.lemmatize(w, wordnet_pos(t))] for w, t in content]

entities = []
for node in nltk.ne_chunk(tagged):
    if hasattr(node, "label"):
        entities.append([" ".join(w for w, _ in node.leaves()), node.label()])


def doc_lemmas(sentence: str) -> list[str]:
    return [
        lemmatizer.lemmatize(w.lower(), wordnet_pos(t))
        for w, t in nltk.pos_tag(nltk.word_tokenize(sentence))
        if w.isalpha() and w.lower() not in stop
    ]


docs = [doc_lemmas(s) for s in sentences]
vocab = sorted({w for d in docs for w in d})
bow = [[d.count(w) for w in vocab] for d in docs]

collection = TextCollection(docs)
tfidf = [
    sorted(
        ([w, round(collection.tf_idf(w, d), 3)] for w in set(d)),
        key=lambda p: (-p[1], p[0]),
    )
    for d in docs
]

# Per-token view of one sentence for the scroll scene: every field is NLTK output.
SCENE_INDEX = 1
scene_sentence = sentences[SCENE_INDEX]
scene_tokens = nltk.word_tokenize(scene_sentence)
scene_tagged = nltk.pos_tag(scene_tokens)
scene = {
    "sentence": scene_sentence,
    "tokens": [
        {
            "t": w,
            "pos": t,
            # removed by cleaning (not alphabetic) or by the stop-word list
            "removed": "clean" if not w.isalpha() else ("stop" if w.lower() in stop else None),
            "stem": stemmer.stem(w.lower()),
            "lemma": lemmatizer.lemmatize(w.lower(), wordnet_pos(t)),
        }
        for w, t in scene_tagged
    ],
    "entities": [
        [" ".join(w for w, _ in node.leaves()), node.label()]
        for node in nltk.ne_chunk(scene_tagged)
        if hasattr(node, "label")
    ],
    "bow": [[w, docs[SCENE_INDEX].count(w)] for w in dict.fromkeys(docs[SCENE_INDEX])],
    "tfidf": [[w, round(collection.tf_idf(w, docs[SCENE_INDEX]), 3)] for w in dict.fromkeys(docs[SCENE_INDEX])],
}

out = {
    "nltkVersion": nltk.__version__,
    "text": TEXT,
    "sentences": sentences,
    "tokens": tokens,
    "stopwordsRemoved": [w for w, _ in content],
    "stems": stems,
    "lemmas": lemmas,
    "pos": [[w, t] for w, t in tagged],
    "entities": entities,
    "bow": {"vocab": vocab, "rows": bow},
    "tfidf": tfidf,
    "scene": scene,
}

path = Path(__file__).resolve().parent.parent / "src" / "data" / "nltk-pipeline.json"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {path}")
