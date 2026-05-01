# ML Evaluation — Campus Companion Event Recommender

## Overview

The recommender surfaces the three most similar campus events for any given event.
It uses **TF-IDF** (Term Frequency–Inverse Document Frequency) to turn each event into
a numeric vector, then ranks all other events by **cosine similarity** to that vector.
No external ML libraries are used — everything is implemented from scratch in TypeScript
(`src/lib/ml/recommender.ts`).

---

## Features Used

Each event is described to the model using four fields:

| Field         | Weight | Rationale |
|---------------|--------|-----------|
| `title`       | ×2     | Short but very signal-dense |
| `description` | ×1     | Background context; noisier |
| `category`    | ×4     | Strongest categorical signal |
| `tags`        | ×3     | Controlled vocabulary; very reliable |

Weighting is achieved by repeating tokens: a category token appears four times
in the document, making it four times more influential than a description token.

---

## How TF-IDF Works (plain English)

### Step 1 — Tokenise

Each event's text is broken into lowercase words:

> *"Hands-on workshop covering supervised learning…"*
> → `["hands", "on", "workshop", "covering", "supervised", "learning", …]`

### Step 2 — Term Frequency (TF)

Count how often each word appears in **this** event, normalised by document length.
A word that makes up 10% of the document has TF = 0.10.

```
TF(t, d) = count(t in d) / total tokens in d
```

### Step 3 — Inverse Document Frequency (IDF)

Measure how **rare** the word is across **all** events.
Common words like "campus" appear everywhere → low IDF (less useful).
Rare words like "cryptography" appear in one event → high IDF (more useful).

```
IDF(t) = log(N / number of events containing t)
```

### Step 4 — TF-IDF score

Multiply them together. A word gets a high score only if it is **frequent in this
event** AND **rare across all events**:

```
TF-IDF(t, d) = TF(t, d) × IDF(t)
```

Every event becomes a sparse vector of TF-IDF scores — one dimension per unique
word in the corpus.

### Step 5 — Cosine Similarity

To compare two events, compute the cosine of the angle between their TF-IDF vectors.

```
similarity(A, B) = (A · B) / (|A| × |B|)
```

- **1.0** → identical vocabulary (angle = 0°)
- **0.0** → no shared terms (angle = 90°)

The top-3 highest-similarity events (excluding self) are returned as recommendations.

---

## Evaluation

### Metric: Category Match Rate (CMR)

For each event's top-3 recommendations, CMR measures the fraction that share the same
category as the query event. A perfect score is 100%.

```
CMR = total category matches / (total events × k)
```

This is a **proxy metric** — same-category events are a good but imperfect measure of
true relevance, especially for broad categories like "Academic".

### Per-Event Results

| Event | Category | Top-3 Recommendations | Matches |
|-------|----------|-----------------------|---------|
| Intro to Machine Learning Workshop | Academic | NLP Seminar, Data Science Study Group, CTF | 3/3 |
| Data Science Study Group | Academic | ML Workshop, NLP Seminar, CTF | 3/3 |
| Spring Career Fair 2025 | Career | Entrepreneurship Panel, CV Clinic, Startup Pitch | 3/3 |
| Resume & LinkedIn Review Clinic | Career | Career Fair, Startup Pitch, Entrepreneurship Panel | 3/3 |
| Interfaculty Basketball Tournament | Sport | Fun Run, Swimming Gala, Yoga | 2/3 |
| 5K Campus Fun Run | Sport | Swimming Gala, Basketball, Board Game Social | 2/3 |
| Acoustic Open Mic Night | Social | Board Game Social, Food Festival, Orchestra Concert | 2/3 |
| International Food Festival | Social | Board Game Social, Open Mic, Fun Run | 2/3 |
| Web Development Hackathon | Academic | CTF, Data Science, ML Workshop | 3/3 |
| Cybersecurity Capture the Flag | Academic | Web Dev Hackathon, Career Fair, Entrepreneurship | 1/3 |
| Mental Health & Mindfulness Session | Wellness | Yoga, Entrepreneurship Panel, Data Science | 1/3 |
| Yoga & Stretching Morning Class | Wellness | Mindfulness Session, Fun Run, Swimming Gala | 1/3 |
| Startup Pitch Competition | Career | Entrepreneurship Panel, Career Fair, CV Clinic | 3/3 |
| Photography Society Exhibition | Arts | Film Screening, Orchestra Concert, Fun Run | 2/3 |
| Student Film Screening Night | Arts | Photography Exhibition, Orchestra Concert, Open Mic | 2/3 |
| Natural Language Processing Seminar | Academic | ML Workshop, Data Science, CTF | 3/3 |
| Swimming Gala | Sport | Fun Run, Basketball, Yoga | 2/3 |
| Board Game & Puzzle Social | Social | Food Festival, Open Mic, Fun Run | 2/3 |
| Entrepreneurship Panel: Founders in Residence | Career | Startup Pitch, Career Fair, CV Clinic | 3/3 |
| Choir & Orchestra Spring Concert | Arts | Open Mic Night, Film Screening, Photography | 2/3 |

### Aggregate Results

| Metric | Value |
|--------|-------|
| **TF-IDF CMR** | **75.0%** |
| Random baseline CMR | 13.7% |
| **Lift over random** | **5.48×** |

### Per-Category Breakdown

| Category | CMR |
|----------|-----|
| Career   | 100.0% |
| Academic | 86.7%  |
| Arts     | 66.7%  |
| Social   | 66.7%  |
| Sport    | 66.7%  |
| Wellness | 33.3%  |

---

## Comparison to Random Baseline

A random recommender picks 3 events uniformly at random (excluding self). Its
expected CMR equals the probability that a randomly chosen event shares the same
category — roughly equal to the largest category's proportion of the dataset.

With 20 events across 6 categories the random CMR is **13.7%**.

The TF-IDF model achieves **75.0%**, a **5.48× lift** — a substantial improvement
from a few dozen lines of classical ML code with no external dependencies.

---

## Error Analysis

**Wellness (33.3%)** is the weakest category. The two wellness events (Mindfulness
Session, Yoga) share some vocabulary ("wellness", "mindfulness") but are small in
count (only 2 events), so after matching each other the third slot often falls outside
the category. More wellness events would help.

**Cybersecurity CTF** is misclassified: its description contains terms like "network"
and "coding" that overlap strongly with Career events (Career Fair mentions
"networking"). This is a known TF-IDF limitation — it has no semantic understanding.

---

## Limitations & Future Work

| Limitation | Potential fix |
|------------|---------------|
| No semantic understanding — "running" ≠ "athletics" | Sentence embeddings (e.g. `all-MiniLM-L6-v2`) |
| Small corpus (20 events) → IDF less meaningful | More events; or smoothed IDF |
| No user history / personalisation | Collaborative filtering layer |
| Similarity scores not calibrated | Platt scaling |
| Stop-word removal not applied | Add stop-word list for cleaner vectors |