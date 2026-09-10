# PIB Spanish 2

All previous coursework, vocabulary, and the flashcard app are archived in [spanish 1](<spanish 1/>).

To use the Spanish 1 app, run `python3 -m http.server 8000` from this directory and open http://localhost:8000/spanish%201/.

Open http://localhost:8000/ for the Spanish 2 vocabulary app or http://localhost:8000/conjugation.html for present-tense verb practice.

The Unit 1 deck contains all 100 term pairs pasted by the user, organized into 13 sections: pronouns, questions, essential verbs, school and communication, everyday activities, food and meals, sleep, bathroom and personal care, getting dressed, feelings and other reflexives, sequence, time, and people/things. The Quizlet heading says 113 terms, so 13 pairs are still missing. No missing terms have been guessed.

Conjugation practice covers all supplied verbs, including both alternatives on cards such as `ser, estar`. Filter by regular, stem-changing, irregular, reflexive, or gustar practice, or choose an individual verb. Vosotros is optional. Reflexive answers require the matching pronoun; phrases retain their objects (for example, `me lavo las manos`). A matching subject pronoun is optional except in the specially labeled gustar exercises, which ask for `me gusta`, `me gustan`, etc. Each answer includes an explanation and a conjugation table is available for reference.

Vocabulary checking accepts any listed translation alternative and ignores case, punctuation, and extra spacing while keeping accents significant. The original pairs are preserved in `data/unit-1-source.tsv`. Run `python3 scripts/build-unit1.py` to rebuild the categorized vocabulary and conjugation data.

Spanish 2 uses separate browser storage keys for progress and imported vocabulary. Spanish 1 files remain archived unchanged.

Run checks with `node --test tests/*.test.mjs`.
