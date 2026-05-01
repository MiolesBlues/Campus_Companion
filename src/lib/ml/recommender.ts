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

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
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
  const totalDocs = allTokens.length;
  const docFreq = new Map<string, number>();

  for (const tokens of allTokens) {
    const seen = new Set(tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log(totalDocs / df));
  }
  return idf;
}

function computeTFIDF(
  tf: Map<string, number>,
  idf: Map<string, number>,
): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tfValue] of tf) {
    const idfValue = idf.get(term) ?? 0;
    tfidf.set(term, tfValue * idfValue);
  }
  return tfidf;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0;
  for (const [term, aVal] of a) {
    const bVal = b.get(term) ?? 0;
    dot += aVal * bVal;
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
): SimilarEvent[] {
  const documents = allEvents.map(buildDocument);
  const idf = computeIDF(documents);

  const tfidfVectors = documents.map((tokens) => {
    const tf = computeTF(tokens);
    return computeTFIDF(tf, idf);
  });

  const targetIndex = allEvents.findIndex((event) => event.id === targetEventId);
  if (targetIndex === -1) return [];

  const targetVector = tfidfVectors[targetIndex];

  const scored = allEvents
    .map((event, index) => ({
      ...event,
      similarity: cosineSimilarity(targetVector, tfidfVectors[index]),
    }))
    .filter((event) => event.id !== targetEventId)
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k);
}
