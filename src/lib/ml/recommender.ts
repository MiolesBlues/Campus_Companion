<<<<<<< HEAD
/**
 * src/lib/ml/recommender.ts
 *
 * Classical ML recommender using TF-IDF (Term Frequency–Inverse Document Frequency)
 * and cosine similarity to find similar campus events.
 *
 * No external ML libraries — all implemented from scratch in TypeScript.
 */
=======
export type Event = {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
};

export type SimilarEvent = Event & { similarity: number };

export function getSimilarEvents(
  targetEventId: string,
  allEvents: Event[],
  k = 3,
): SimilarEvent[] {
  const targetEvent = allEvents.find((event) => event.id === targetEventId);
>>>>>>> 7b2d388c2a75330178304698715dbe15b052f76b

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
}

<<<<<<< HEAD
/** A scored event returned by the recommender */
export interface ScoredEvent {
  event: Event;
  score: number; // cosine similarity [0, 1]
}
=======
  function tokenize(event: Event): string[] {
    const text = [
      event.title,
      event.description,
      event.category,
      ...(event.tags || []),
      event.category,
      ...(event.tags || [])
    ].join(" ");
>>>>>>> 7b2d388c2a75330178304698715dbe15b052f76b

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/**
 * Tokenise a string into lowercase words, stripping punctuation.
 * e.g. "Hello, World!" → ["hello", "world"]
 */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1); // drop single chars
}

/**
 * Build a "bag of words" from an event.
 * Category and tags are repeated to give them extra weight compared
 * to free-text fields (title, description).
 *
 * Weight multipliers (tunable):
 *  - category  × 4   (very strong signal)
 *  - tags      × 3   (strong signal)
 *  - title     × 2   (medium signal)
 *  - description × 1 (base weight)
 */
function buildDocument(event: Event): string[] {
  const titleTokens = tokenise(event.title);
  const descTokens = tokenise(event.description);
  const categoryTokens = tokenise(event.category);
  const tagTokens = event.tags.flatMap((tag) => tokenise(tag));

  return [
    ...titleTokens, ...titleTokens,                          // ×2
    ...descTokens,                                            // ×1
    ...categoryTokens, ...categoryTokens,
    ...categoryTokens, ...categoryTokens,                    // ×4
    ...tagTokens, ...tagTokens, ...tagTokens,                // ×3
  ];
}

// ---------------------------------------------------------------------------
// TF-IDF
// ---------------------------------------------------------------------------

/**
 * Term Frequency: how often a term appears in a document (normalised by doc length).
 * TF(t, d) = count(t in d) / |d|
 */
function computeTF(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  const tf = new Map<string, number>();
  for (const [term, count] of counts) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/**
 * Inverse Document Frequency: how rare a term is across all documents.
 * IDF(t) = log(N / df(t))  where df(t) = number of documents containing t.
 * Rare terms get high IDF; common terms get low IDF.
 */
function computeIDF(allTokens: string[][]): Map<string, number> {
  const N = allTokens.length;
  const docFreq = new Map<string, number>();

  for (const tokens of allTokens) {
    const seen = new Set(tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log(N / df)); // natural log
  }
  return idf;
}

/**
 * TF-IDF vector for one document given a shared IDF table.
 * tfidf(t, d) = TF(t, d) × IDF(t)
 */
function computeTFIDF(
  tf: Map<string, number>,
  idf: Map<string, number>
): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tfVal] of tf) {
    const idfVal = idf.get(term) ?? 0;
    tfidf.set(term, tfVal * idfVal);
  }
  return tfidf;
}

// ---------------------------------------------------------------------------
// Cosine similarity
// ---------------------------------------------------------------------------

/**
 * Cosine similarity between two TF-IDF sparse vectors.
 * similarity = (A · B) / (|A| × |B|)
 *
 * Returns 1.0 for identical vectors, 0.0 for completely different.
 * Handles the zero-vector edge case gracefully.
 */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  // Dot product (iterate over smaller map for efficiency)
  let dot = 0;
  for (const [term, aVal] of a) {
    const bVal = b.get(term) ?? 0;
    dot += aVal * bVal;
  }

  // Magnitudes
  const magA = Math.sqrt([...a.values()].reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt([...b.values()].reduce((s, v) => s + v * v, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * getSimilarEvents
 *
 * Given a target event ID, returns the top-k most similar events from the
 * full list (excluding the target itself), ranked by cosine similarity of
 * their TF-IDF vectors.
 *
 * @param targetEventId  - The ID of the event we want recommendations for.
 * @param allEvents      - The full list of events (including the target).
 * @param k              - Number of similar events to return (default: 3).
 * @returns              - Sorted list of { event, score } pairs (highest first).
 */
export function getSimilarEvents(
  targetEventId: string,
  allEvents: Event[],
  k = 3
): ScoredEvent[] {
  // Step 1: Build token documents for every event
  const documents: string[][] = allEvents.map(buildDocument);

  // Step 2: Compute IDF across all documents
  const idf = computeIDF(documents);

  // Step 3: Compute TF-IDF vector for every event
  const tfidfVectors: Map<string, number>[] = documents.map((tokens) => {
    const tf = computeTF(tokens);
    return computeTFIDF(tf, idf);
  });

  // Step 4: Find the target event's vector
  const targetIndex = allEvents.findIndex((e) => e.id === targetEventId);
  if (targetIndex === -1) return [];
  const targetVector = tfidfVectors[targetIndex];

  // Step 5: Score every other event by cosine similarity
  const scored: ScoredEvent[] = allEvents
    .map((event, idx) => ({
      event,
      score: cosineSimilarity(targetVector, tfidfVectors[idx]),
    }))
    .filter((s) => s.event.id !== targetEventId); // exclude self

  // Step 6: Sort descending by score, return top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}