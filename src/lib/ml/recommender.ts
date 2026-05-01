/**
 * src/lib/ml/recommender.ts
 *
 * Classical ML recommender using TF-IDF and cosine similarity to find similar
 * campus events. No external ML libraries are used.
 */

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

export interface ScoredEvent {
  event: Event;
  score: number;
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function buildDocument(event: Event): string[] {
  const titleTokens = tokenise(event.title);
  const descTokens = tokenise(event.description);
  const categoryTokens = tokenise(event.category);
  const tagTokens = event.tags.flatMap((tag) => tokenise(tag));

  return [
    ...titleTokens,
    ...titleTokens,
    ...descTokens,
    ...categoryTokens,
    ...categoryTokens,
    ...categoryTokens,
    ...categoryTokens,
    ...tagTokens,
    ...tagTokens,
    ...tagTokens,
  ];
}

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

function computeIDF(allTokens: string[][]): Map<string, number> {
  const docFreq = new Map<string, number>();

  for (const tokens of allTokens) {
    const seen = new Set(tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log(allTokens.length / df));
  }
  return idf;
}

function computeTFIDF(
  tf: Map<string, number>,
  idf: Map<string, number>,
): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tfVal] of tf) {
    tfidf.set(term, tfVal * (idf.get(term) ?? 0));
  }
  return tfidf;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0;
  for (const [term, aVal] of a) {
    dot += aVal * (b.get(term) ?? 0);
  }

  const magA = Math.sqrt([...a.values()].reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt([...b.values()].reduce((sum, value) => sum + value * value, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function getSimilarEvents(
  targetEventId: string,
  allEvents: Event[],
  k = 3,
): ScoredEvent[] {
  const documents = allEvents.map(buildDocument);
  const idf = computeIDF(documents);
  const tfidfVectors = documents.map((tokens) => computeTFIDF(computeTF(tokens), idf));

  const targetIndex = allEvents.findIndex((event) => event.id === targetEventId);
  if (targetIndex === -1) return [];

  const targetVector = tfidfVectors[targetIndex];
  return allEvents
    .map((event, index) => ({
      event,
      score: cosineSimilarity(targetVector, tfidfVectors[index]),
    }))
    .filter((scored) => scored.event.id !== targetEventId)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
